
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { User, AppPermission, UserPermissionSet, NewUserPayload } from '../types';
import { useUser } from '../contexts/UserContext';

interface UserManagementPageProps {
  users: User[]; 
  setUsers: React.Dispatch<React.SetStateAction<User[]>>; 
}

const UserManagementPage: React.FC<UserManagementPageProps> = ({ 
    users, 
    setUsers,
}) => {
  const { currentUser } = useUser();
  
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formPermissions, setFormPermissions] = useState<UserPermissionSet>({});
  
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 7000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const availablePermissions = useMemo(() => {
    return Object.values(AppPermission);
  }, []);

  const resetForm = useCallback(() => {
    setFormUsername('');
    setFormPassword('');
    setFormPermissions({});
    setEditingUser(null);
    setError(null);
  }, []);

  const handleEditClick = useCallback((userToEdit: User) => {
    setEditingUser(userToEdit);
    setFormUsername(userToEdit.username);
    setFormPassword(''); // Password should be explicitly set if changed
    setFormPermissions({ ...userToEdit.permissions });
    setError(null);
    setSuccessMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleCancelEdit = useCallback(() => {
    resetForm();
  }, [resetForm]);

  const handlePermissionChange = (permission: AppPermission, checked: boolean) => {
    setFormPermissions(prev => ({ ...prev, [permission]: checked }));
  };

  const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    const trimmedUsername = formUsername.trim();
    const trimmedPassword = formPassword.trim();

    if (!trimmedUsername) {
      setError("Username is required.");
      setIsSubmitting(false);
      return;
    }
    if (!editingUser && !trimmedPassword) {
      setError("Password is required for new users.");
      setIsSubmitting(false);
      return;
    }
    if (users.find(u => u.username.toLowerCase() === trimmedUsername.toLowerCase() && u.id !== editingUser?.id)) {
        setError("Username already exists.");
        setIsSubmitting(false);
        return;
    }
    
    // Permission checks for admin rights
    if (editingUser && editingUser.isDefaultAdmin) {
        const adminUsersWithManagePermission = users.filter(u => u.permissions[AppPermission.CAN_MANAGE_USERS]);
        if (adminUsersWithManagePermission.length <= 1 && adminUsersWithManagePermission[0].id === editingUser.id && !formPermissions[AppPermission.CAN_MANAGE_USERS]) {
            setError("Cannot remove 'Manage Users' permission from the sole administrator with this right.");
            setIsSubmitting(false);
            return;
        }
    }
    
    const finalPermissions: UserPermissionSet = {};
    availablePermissions.forEach(permKey => {
        finalPermissions[permKey] = !!formPermissions[permKey];
    });

    try {
      if (editingUser) {
        // Edit User
        setUsers(prevUsers => prevUsers.map(u => 
            u.id === editingUser.id 
            ? {
                ...u,
                username: editingUser.isDefaultAdmin ? u.username : trimmedUsername, // Default admin username does not change
                password: trimmedPassword ? trimmedPassword : u.password, // Update password if new one is provided
                permissions: finalPermissions,
              }
            : u
        ));
        setSuccessMessage(`User "${editingUser.isDefaultAdmin ? editingUser.username : trimmedUsername}" updated successfully.`);
      } else {
        // Add New User
        const newUser: User = {
          id: crypto.randomUUID(),
          username: trimmedUsername,
          password: trimmedPassword, // Password required for new user
          permissions: finalPermissions,
          isDefaultAdmin: false, // New users are not default admin
        };
        setUsers(prevUsers => [...prevUsers, newUser]);
        setSuccessMessage(`User "${newUser.username}" added successfully.`);
      }
      resetForm();
    } catch (localError: any) { // Catch any unexpected error during state update
      setError(localError.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formUsername, formPassword, formPermissions, users, editingUser, resetForm, setUsers, availablePermissions]);

  const handleDeleteUser = useCallback(async (userIdToDelete: string) => {
    setError(null);
    setSuccessMessage(null);
    const userToDelete = users.find(u => u.id === userIdToDelete);
    if (!userToDelete) {
      setError("User not found.");
      return;
    }
    if (userToDelete.id === currentUser?.id) {
      setError("You cannot delete your own account.");
      return;
    }
    if (userToDelete.isDefaultAdmin) {
      setError("The default admin account cannot be deleted.");
      return;
    }
    
    const adminUsersWithManagePermission = users.filter(u => u.permissions[AppPermission.CAN_MANAGE_USERS]);
    if (userToDelete.permissions[AppPermission.CAN_MANAGE_USERS] && adminUsersWithManagePermission.length <= 1 && adminUsersWithManagePermission[0].id === userToDelete.id) {
        setError("Cannot delete the last user with 'Manage Users' permission.");
        return;
    }

    if (!window.confirm(`Are you sure you want to delete user "${userToDelete.username}"? This action cannot be undone.`)) {
        return;
    }

    setIsSubmitting(true);
    try {
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userIdToDelete));
      setSuccessMessage(`User "${userToDelete.username}" deleted successfully.`);
    } catch (localError: any) {
      setError(localError.message || 'Failed to delete user.');
    } finally {
      setIsSubmitting(false);
    }
  }, [users, setUsers, currentUser]);
  
  // Icons
  const UserPlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766z" /></svg>;
  const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>;
  const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.243.096 3.297.266M6.937 9.043c.626-.169 1.282-.296 1.968-.376M14.063 9.043c.626-.169 1.282-.296 1.968-.376" /></svg>;
  const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>;
  const KeyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>;


  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8">
      <header className="mb-2">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">User Management</h1>
        <p className="text-lg text-slate-700 mt-1">Administer user accounts and permissions locally.</p>
      </header>

      {error && <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg shadow" role="alert">{error}</div>}
      {successMessage && <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg shadow" role="alert">{successMessage}</div>}

      <section aria-labelledby="form-title" className="bg-white p-6 rounded-xl shadow-2xl">
        <h2 id="form-title" className="text-2xl font-semibold text-slate-800 mb-6 border-b pb-4">
          {editingUser ? `Edit User: ${editingUser.username}` : "Add New User"}
        </h2>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="formUsername" className="block text-sm font-semibold text-slate-800 mb-1">Username</label>
              <input type="text" id="formUsername" value={formUsername} 
                     onChange={(e) => setFormUsername(e.target.value)} required 
                     disabled={isSubmitting || !!editingUser?.isDefaultAdmin}
                     className={`w-full px-3.5 py-2.5 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm ${editingUser?.isDefaultAdmin ? 'bg-slate-100 cursor-not-allowed' : ''}`}/>
              {editingUser?.isDefaultAdmin && <p className="text-xs text-slate-500 mt-1">Default admin username cannot be changed.</p>}
            </div>
            <div>
              <label htmlFor="formPassword" className="block text-sm font-semibold text-slate-800 mb-1">Password</label>
              <input type="password" id="formPassword" value={formPassword} 
                     onChange={(e) => setFormPassword(e.target.value)} 
                     required={!editingUser} 
                     placeholder={editingUser ? "(Leave blank to keep current)" : ""}
                     disabled={isSubmitting}
                     className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"/>
            </div>
          </div>
          <div>
            <h3 className="text-md font-semibold text-slate-800 mb-2 pt-2 border-t mt-4">Permissions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3">
              {availablePermissions.map(permissionKey => (
                <div key={permissionKey} className="flex items-center">
                  <input type="checkbox" id={`perm-${permissionKey}`} checked={!!formPermissions[permissionKey]} 
                         onChange={(e) => handlePermissionChange(permissionKey, e.target.checked)}
                         disabled={isSubmitting || (editingUser?.isDefaultAdmin && permissionKey === AppPermission.CAN_MANAGE_USERS && users.filter(u=>u.isDefaultAdmin && u.permissions[AppPermission.CAN_MANAGE_USERS]).length <=1) }
                         className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"/>
                  <label htmlFor={`perm-${permissionKey}`} className="ml-2 text-sm text-slate-700 select-none">
                    {permissionKey.replace(/CAN_|_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).trim()}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-4 flex items-center space-x-3">
            <button type="submit" disabled={isSubmitting} className="inline-flex items-center px-5 py-3 bg-sky-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-150 ease-in-out transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed">
              {isSubmitting ? 'Submitting...' : (editingUser ? <><SaveIcon /> Save Changes</> : <><UserPlusIcon /> Add User</>)}
            </button>
            {editingUser && (
              <button type="button" onClick={handleCancelEdit} disabled={isSubmitting} className="inline-flex items-center px-5 py-3 bg-slate-200 text-slate-800 text-sm font-semibold rounded-lg shadow-md hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-all duration-150 ease-in-out disabled:opacity-70">
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section aria-labelledby="user-list-title" className="bg-white rounded-xl shadow-2xl overflow-hidden">
        <h2 id="user-list-title" className="text-2xl font-semibold text-slate-800 p-6 border-b">Existing Users</h2>
        {users.length === 0 && <div className="p-6 text-center text-slate-600">No users found.</div>}
        {users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-800">
              <thead className="text-xs text-slate-800 uppercase bg-slate-200/70">
                <tr>
                  <th scope="col" className="px-6 py-3.5 font-semibold">Username</th>
                  <th scope="col" className="px-6 py-3.5 font-semibold">Password (Demo only)</th>
                  <th scope="col" className="px-6 py-3.5 font-semibold">Permissions</th>
                  <th scope="col" className="px-6 py-3.5 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-sky-50/50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">{user.username} {user.isDefaultAdmin && <span className="ml-2 text-xs bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded-full">System Admin</span>}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-mono text-xs">{user.password}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                          {availablePermissions.filter(p => user.permissions[p]).map(pKey => (
                              <span key={`${user.id}-${pKey}`} className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded-full flex items-center">
                                  <KeyIcon /> {pKey.replace(/CAN_|_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).trim()}
                              </span>
                          ))}
                          {availablePermissions.filter(p => user.permissions[p]).length === 0 && <span className="text-xs text-slate-500 italic">No explicit permissions</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button 
                          onClick={() => handleEditClick(user)} 
                          className="inline-flex items-center text-sky-600 hover:text-sky-800 hover:bg-sky-100 p-1.5 rounded-md transition-all font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label={`Edit user ${user.username}`}
                           disabled={isSubmitting || (user.id === currentUser?.id && user.isDefaultAdmin && users.filter(u=>u.permissions[AppPermission.CAN_MANAGE_USERS]).length <=1 )}
                         >
                          <EditIcon /> Edit
                        </button>
                        {!(user.id === currentUser?.id) && !user.isDefaultAdmin && (
                          <button 
                            onClick={() => handleDeleteUser(user.id)} 
                            disabled={isSubmitting}
                            className="inline-flex items-center text-red-500 hover:text-red-700 hover:bg-red-100 p-1.5 rounded-md transition-all font-medium text-xs disabled:opacity-50"
                            aria-label={`Delete user ${user.username}`}
                          >
                            <TrashIcon /> Delete
                          </button>
                        )}
                      </div>
                       {(user.id === currentUser?.id && user.isDefaultAdmin && users.filter(u=>u.permissions[AppPermission.CAN_MANAGE_USERS]).length <=1) && <p className="text-xs text-slate-500 mt-1">(Self-edit disabled for sole admin)</p>}
                       {(user.id === currentUser?.id && !user.isDefaultAdmin) && <p className="text-xs text-slate-500 mt-1">(Current User)</p>}
                       {user.isDefaultAdmin && user.id !== currentUser?.id && <p className="text-xs text-slate-500 mt-1">(System Admin)</p>}

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
       <div className="mt-8 p-4 bg-amber-50 border border-amber-300 text-amber-800 rounded-lg text-sm shadow">
            <h4 className="font-semibold mb-1">Security & Functionality Notes:</h4>
            <ul className="list-disc list-inside space-y-1">
                <li>User data (including passwords in plain text) is stored in your browser's localStorage. This is for demo purposes only and is not secure for real applications.</li>
                <li>The "System Admin" is the default 'user'/'password' account. It has all permissions and its username cannot be changed.</li>
                <li>Ensure you do not accidentally remove the 'Manage Users' permission from the last admin user.</li>
            </ul>
        </div>
    </div>
  );
};

export default UserManagementPage;
