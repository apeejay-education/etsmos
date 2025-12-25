import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface CreateUserRequest {
  email: string;
  password: string;
  full_name: string;
  person_id: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with user's token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // User client to check permissions
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    })
    
    // Verify the user making the request is an admin
    const { data: { user }, error: userError } = await userClient.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is admin using service role
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)
    const { data: roleData, error: roleError } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (roleError || roleData?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Only admins can create users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { email, password, full_name, person_id }: CreateUserRequest = await req.json()

    if (!email || !password || !full_name || !person_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate password strength
    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 6 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const emailNormalized = email.trim().toLowerCase();

    const ensureViewerRole = async (userId: string) => {
      const { data: existingRole, error: roleSelectError } = await adminClient
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (roleSelectError) {
        console.warn('Could not check existing role:', roleSelectError);
        return;
      }

      if (!existingRole) {
        const { error: insertRoleError } = await adminClient
          .from('user_roles')
          .insert({ user_id: userId, role: 'viewer' });

        if (insertRoleError) {
          console.warn('Could not assign viewer role:', insertRoleError);
        }
      }
    };

    // Create the auth user with service role
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: emailNormalized,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: { full_name },
    });

    let finalUserId: string | null = authData?.user?.id ?? null;

    // If user already exists, update their password instead of failing
    if (authError && authError.message?.toLowerCase().includes('already') && authError.message?.toLowerCase().includes('registered')) {
      console.log('User already exists, attempting to find and update password:', emailNormalized);

      const { data: listData, error: listError } = await adminClient.auth.admin.listUsers();
      if (listError) {
        console.error('Failed to list users:', listError);
        return new Response(
          JSON.stringify({ error: 'User already exists, but could not fetch existing user record' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const existing = listData?.users?.find((u: any) => (u.email || '').toLowerCase() === emailNormalized);
      if (!existing?.id) {
        return new Response(
          JSON.stringify({ error: 'A user with this email already exists, but could not find the user id' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error: updateAuthError } = await adminClient.auth.admin.updateUserById(existing.id, {
        password,
        user_metadata: { full_name },
      });

      if (updateAuthError) {
        console.error('Failed to update existing user password:', updateAuthError);
        return new Response(
          JSON.stringify({ error: updateAuthError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      finalUserId = existing.id;
    } else if (authError) {
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!finalUserId) {
      return new Response(
        JSON.stringify({ error: 'Failed to resolve user id for created/updated account' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Ensure the user has at least a viewer role (existing users might not have one)
    await ensureViewerRole(finalUserId);

    // First, unlink any existing person record that may be linked to this user_id
    // (to avoid unique constraint violation on people.user_id)
    const { error: unlinkError } = await adminClient
      .from('people')
      .update({ user_id: null })
      .eq('user_id', finalUserId)
      .neq('id', person_id);

    if (unlinkError) {
      console.warn('Could not unlink existing person record:', unlinkError);
    }

    // Link the person record to the auth user and set must_reset_password
    const { error: updateError } = await adminClient
      .from('people')
      .update({
        user_id: finalUserId,
        must_reset_password: true,
      })
      .eq('id', person_id);

    if (updateError) {
      console.error('Failed to link user to person:', updateError);
      // Rollback only if we just created a new user
      if (authData?.user?.id && authData.user.id === finalUserId) {
        await adminClient.auth.admin.deleteUser(finalUserId);
      }

      return new Response(
        JSON.stringify({ error: 'Failed to link user to person record: ' + updateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_id: finalUserId,
        message: `User ready. They can log in with email: ${emailNormalized} and the provided password.`,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error creating user:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})