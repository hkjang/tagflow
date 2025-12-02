import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole, LoginRequest, LoginResponse, TokenPayload } from '@shared/user';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<Omit<User, 'password_hash'> | null> {
    const user = this.db.queryOne<User>(
      'SELECT * FROM users WHERE username = ?',
      [username],
    );

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...result } = user;
    return result;
  }

  async login(loginDto: LoginRequest): Promise<LoginResponse> {
    const user = await this.validateUser(loginDto.username, loginDto.password);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const payload: TokenPayload = {
      sub: user.id,
      username: user.username,
      role: user.role as UserRole,
    };

    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Trigger cleanup if admin user
    if (user.role === UserRole.ADMIN) {
      // Import cleanup service asynchronously to avoid circular dependency
      const { CleanupService } = await import('../cleanup/cleanup.service');
      const cleanupService = new CleanupService(this.db);
      
      try {
        await cleanupService.cleanupOldData(user.id);
      } catch (error) {
        console.error('Auto-cleanup failed on admin login:', error);
        // Don't fail the login if cleanup fails
      }
    }

    return {
      access_token,
      refresh_token,
      user,
    };
  }

  async refreshToken(oldToken: string): Promise<{ access_token: string }> {
    try {
      const payload = this.jwtService.verify(oldToken);
      const newPayload: TokenPayload = {
        sub: payload.sub,
        username: payload.username,
        role: payload.role,
      };

      return {
        access_token: this.jwtService.sign(newPayload),
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async createUser(
    username: string,
    password: string,
    role: UserRole,
  ): Promise<Omit<User, 'password_hash'>> {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = this.db.exec(
      'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
      [username, hashedPassword, role],
    );

    const user = this.db.queryOne<User>(
      'SELECT * FROM users WHERE id = ?',
      [result.lastInsertRowid],
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getUserById(id: number): Promise<Omit<User, 'password_hash'> | null> {
    const user = this.db.queryOne<User>(
      'SELECT * FROM users WHERE id = ?',
      [id],
    );

    if (!user) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...result } = user;
    return result;
  }

  async getAllUsers(): Promise<Omit<User, 'password_hash'>[]> {
    const users = this.db.query<User>('SELECT * FROM users');
    return users.map(user => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password_hash, ...result } = user;
      return result;
    });
  }

  async updateUser(
    id: number,
    updates: Partial<{ username: string; password: string; role: UserRole }>,
  ): Promise<Omit<User, 'password_hash'>> {
    const user = await this.getUserById(id);
    if (!user) {
      throw new Error('User not found');
    }

    let sql = 'UPDATE users SET ';
    const params: any[] = [];
    const setParts: string[] = [];

    if (updates.username) {
      setParts.push('username = ?');
      params.push(updates.username);
    }

    if (updates.password) {
      const hashedPassword = await bcrypt.hash(updates.password, 10);
      setParts.push('password_hash = ?');
      params.push(hashedPassword);
    }

    if (updates.role) {
      setParts.push('role = ?');
      params.push(updates.role);
    }

    if (setParts.length === 0) {
      return user;
    }

    sql += setParts.join(', ') + ' WHERE id = ?';
    params.push(id);

    this.db.exec(sql, params);

    return await this.getUserById(id);
  }

  async deleteUser(id: number): Promise<void> {
    this.db.exec('DELETE FROM users WHERE id = ?', [id]);
  }
}
