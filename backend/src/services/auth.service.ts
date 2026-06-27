import { sequelize } from '../models';
import { userRepository } from '../repositories/user.repository';
import { walletRepository } from '../repositories/wallet.repository';
import { hashPassword, verifyPassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';

export const authService = {
  async signup(email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await userRepository.findByEmail(normalizedEmail);
    if (existing) {
      throw AppError.conflict('Email already registered');
    }

    const passwordHash = await hashPassword(password);

    // Create the user and its wallet atomically.
    const user = await sequelize.transaction(async (tx) => {
      const created = await userRepository.create(normalizedEmail, passwordHash, tx);
      await walletRepository.create(created.id, tx);
      return created;
    });

    const token = signToken({ userId: user.id, email: user.email });
    return { token, user: { id: user.id, email: user.email } };
  },

  async login(email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await userRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw AppError.unauthorized('Invalid credentials');
    }

    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) {
      throw AppError.unauthorized('Invalid credentials');
    }

    // Defensive: ensure a wallet exists for legacy accounts.
    await walletRepository.findOrCreateByUserId(user.id);

    const token = signToken({ userId: user.id, email: user.email });
    return { token, user: { id: user.id, email: user.email } };
  },
};
