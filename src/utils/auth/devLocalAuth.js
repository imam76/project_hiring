import { userApi } from '@/utils/hooks/useUsers';
import bcrypt from 'bcryptjs';

export async function devLocalLogin(email, password) {
  if (!email || !password)
    return { success: false, error: 'Email/password kosong' };

  try {
    const user = await userApi.fetchUserByEmail(email);
    console.log('useraaaaaaaaaaaaaaaaaaaa =>', user);
    if (!user?.password_hash) {
      return {
        success: false,
        error: 'password_hash tidak ada untuk user ini',
      };
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return { success: false, error: 'Email atau password salah' };

    const safeUser = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      company_name: user.company_name,
    };

    return { success: true, user: safeUser };
  } catch (err) {
    return { success: false, error: err.message || 'Login gagal' };
  }
}
