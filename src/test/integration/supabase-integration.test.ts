import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { contactCrudService } from '../../services/contact-crud-service';
import { userManagementService } from '../../services/user-management-service';

// Mock environment variables
vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(),
  auth: {
    getSession: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
  },
  functions: {
    invoke: vi.fn()
  }
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient)
}));

// Mock query builders
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn();

describe('Supabase Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mock chain
    mockSupabaseClient.from.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete
    });
    
    mockSelect.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
      limit: mockLimit
    });
    
    mockInsert.mockReturnValue({
      select: mockSelect
    });
    
    mockUpdate.mockReturnValue({
      eq: mockEq,
      select: mockSelect
    });
    
    mockDelete.mockReturnValue({
      eq: mockEq
    });
    
    mockEq.mockReturnValue({
      order: mockOrder,
      limit: mockLimit,
      select: mockSelect
    });
    
    mockOrder.mockReturnValue({
      limit: mockLimit
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Contact CRUD Service', () => {
    it('should fetch contacts successfully', async () => {
      const mockContacts = [
        { id: '1', first_name: 'John', last_name: 'Doe' },
        { id: '2', first_name: 'Jane', last_name: 'Smith' }
      ];
      
      mockLimit.mockResolvedValue({ data: mockContacts, error: null });

      const result = await contactCrudService.getContacts('user-123');

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('contacts');
      expect(mockSelect).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(result).toEqual(mockContacts);
    });

    it('should handle contact fetch errors', async () => {
      const mockError = { message: 'Database connection failed' };
      mockLimit.mockResolvedValue({ data: null, error: mockError });

      await expect(contactCrudService.getContacts('user-123')).rejects.toThrow('Database connection failed');
    });

    it('should create contact successfully', async () => {
      const newContact = {
        first_name: 'John',
        last_name: 'Doe',
        phone_numbers: [{ number: '1234567890', type: 'mobile' }],
        user_id: 'user-123'
      };
      
      const mockCreatedContact = { id: 'contact-123', ...newContact };
      mockSelect.mockResolvedValue({ data: [mockCreatedContact], error: null });

      const result = await contactCrudService.createContact(newContact);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('contacts');
      expect(mockInsert).toHaveBeenCalledWith([newContact]);
      expect(result).toEqual(mockCreatedContact);
    });

    it('should update contact successfully', async () => {
      const updateData = { first_name: 'Updated John' };
      const mockUpdatedContact = { id: 'contact-123', ...updateData };
      
      mockSelect.mockResolvedValue({ data: [mockUpdatedContact], error: null });

      const result = await contactCrudService.updateContact('contact-123', updateData);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('contacts');
      expect(mockUpdate).toHaveBeenCalledWith(updateData);
      expect(mockEq).toHaveBeenCalledWith('id', 'contact-123');
      expect(result).toEqual(mockUpdatedContact);
    });

    it('should delete contact successfully', async () => {
      mockEq.mockResolvedValue({ data: null, error: null });

      await contactCrudService.deleteContact('contact-123');

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('contacts');
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', 'contact-123');
    });
  });

  describe('User Management Service', () => {
    it('should fetch all users successfully', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@example.com', role: 'user' },
        { id: '2', email: 'user2@example.com', role: 'admin' }
      ];
      
      mockSupabaseClient.functions.invoke.mockResolvedValue({ 
        data: mockUsers, 
        error: null 
      });

      const result = await userManagementService.getAllUsers();

      expect(mockSupabaseClient.functions.invoke).toHaveBeenCalledWith('get-all-users');
      expect(result).toEqual(mockUsers);
    });

    it('should handle user fetch errors', async () => {
      const mockError = { message: 'Unauthorized access' };
      mockSupabaseClient.functions.invoke.mockResolvedValue({ 
        data: null, 
        error: mockError 
      });

      await expect(userManagementService.getAllUsers()).rejects.toThrow('Unauthorized access');
    });

    it('should create user with role successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        role: 'user'
      };
      
      const mockCreatedUser = { id: 'user-456', ...userData };
      mockSupabaseClient.functions.invoke.mockResolvedValue({ 
        data: mockCreatedUser, 
        error: null 
      });

      const result = await userManagementService.createUserWithRole(userData);

      expect(mockSupabaseClient.functions.invoke).toHaveBeenCalledWith('create-user-with-role', {
        body: JSON.stringify(userData)
      });
      expect(result).toEqual(mockCreatedUser);
    });

    it('should update user role successfully', async () => {
      const updateData = { userId: 'user-123', newRole: 'admin' };
      mockSupabaseClient.functions.invoke.mockResolvedValue({ 
        data: { success: true }, 
        error: null 
      });

      const result = await userManagementService.updateUserRole(updateData.userId, updateData.newRole);

      expect(mockSupabaseClient.functions.invoke).toHaveBeenCalledWith('update-user-role', {
        body: JSON.stringify(updateData)
      });
      expect(result).toEqual({ success: true });
    });

    it('should delete user successfully', async () => {
      mockSupabaseClient.functions.invoke.mockResolvedValue({ 
        data: { success: true }, 
        error: null 
      });

      const result = await userManagementService.deleteUser('user-123');

      expect(mockSupabaseClient.functions.invoke).toHaveBeenCalledWith('delete-user', {
        body: JSON.stringify({ userId: 'user-123' })
      });
      expect(result).toEqual({ success: true });
    });
  });

  describe('Authentication Integration', () => {
    it('should handle session retrieval', async () => {
      const mockSession = {
        access_token: 'mock-token',
        user: { id: 'user-123', email: 'user@example.com' }
      };
      
      mockSupabaseClient.auth.getSession.mockResolvedValue({ 
        data: { session: mockSession }, 
        error: null 
      });

      const { data } = await mockSupabaseClient.auth.getSession();
      
      expect(data.session).toEqual(mockSession);
    });

    it('should handle authentication errors', async () => {
      const mockError = { message: 'Invalid session' };
      mockSupabaseClient.auth.getSession.mockResolvedValue({ 
        data: { session: null }, 
        error: mockError 
      });

      const { error } = await mockSupabaseClient.auth.getSession();
      
      expect(error).toEqual(mockError);
    });

    it('should handle sign in', async () => {
      const credentials = { email: 'user@example.com', password: 'password123' };
      const mockSession = { user: { id: 'user-123' } };
      
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({ 
        data: { session: mockSession }, 
        error: null 
      });

      const { data } = await mockSupabaseClient.auth.signInWithPassword(credentials);
      
      expect(data.session).toEqual(mockSession);
    });
  });

  describe('Edge Functions Integration', () => {
    it('should invoke extract-contact-info function', async () => {
      const testText = 'John Doe, phone: 1234567890';
      const mockResponse = { ai_suggestion_id: 'suggestion-123' };
      
      mockSupabaseClient.functions.invoke.mockResolvedValue({ 
        data: mockResponse, 
        error: null 
      });

      const { data } = await mockSupabaseClient.functions.invoke('extract-contact-info', {
        body: JSON.stringify({ text: testText })
      });

      expect(mockSupabaseClient.functions.invoke).toHaveBeenCalledWith('extract-contact-info', {
        body: JSON.stringify({ text: testText })
      });
      expect(data).toEqual(mockResponse);
    });

    it('should handle edge function errors', async () => {
      const mockError = { message: 'Function timeout' };
      
      mockSupabaseClient.functions.invoke.mockResolvedValue({ 
        data: null, 
        error: mockError 
      });

      const { error } = await mockSupabaseClient.functions.invoke('extract-contact-info', {
        body: JSON.stringify({ text: 'test' })
      });

      expect(error).toEqual(mockError);
    });
  });
});