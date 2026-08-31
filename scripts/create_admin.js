import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://oewgdrbxbpgbcnnjqthh.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SERVICE_ROLE_KEY) {
  console.log('Vui lòng thiết lập biến môi trường SUPABASE_SERVICE_ROLE_KEY để chạy script.');
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY || 'dummy-key', {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminAccount() {
  const adminEmail = 'admin@khtn.edu.vn';
  const adminPassword = 'Admin@123456';
  const adminFullName = 'Cô Nguyễn Thị Hảo (Tổ Trưởng KHTN)';

  console.log(`Đang kiểm tra/tạo tài khoản Quản trị: ${adminEmail}...`);

  const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) {
    console.error('Lỗi khi đọc danh sách user:', listError);
    return;
  }

  let existingUser = usersData.users.find(u => u.email === adminEmail);
  let userId = existingUser ? existingUser.id : null;

  if (!existingUser) {
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: adminFullName,
        role: 'admin',
        specialty: 'Khoa học Tự nhiên',
        duties: 'Tổ trưởng chuyên môn - Quản trị viên'
      }
    });

    if (createError) {
      console.error('Lỗi khi tạo user:', createError);
      return;
    }
    userId = newUser.user.id;
    console.log('✅ Đã tạo tài khoản Auth thành công với ID:', userId);
  } else {
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: adminFullName,
        role: 'admin',
        specialty: 'Khoa học Tự nhiên',
        duties: 'Tổ trưởng chuyên môn - Quản trị viên'
      }
    });
    if (updateError) {
      console.error('Lỗi khi cập nhật user:', updateError);
    } else {
      console.log('✅ Đã cập nhật mật khẩu cho user ID:', userId);
    }
  }

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: userId,
      email: adminEmail,
      full_name: adminFullName,
      role: 'admin',
      specialty: 'Khoa học Tự nhiên',
      duties: 'Tổ trưởng chuyên môn - Quản trị viên',
      is_active: true
    });

  if (profileError) {
    console.error('Lỗi khi cập nhật bảng profiles:', profileError);
  } else {
    console.log('✅ Đã cấp quyền ADMIN tối cao trong bảng profiles thành công!');
  }
}

if (SERVICE_ROLE_KEY) {
  createAdminAccount();
}
