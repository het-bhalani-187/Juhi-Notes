import React, { useState, useEffect } from 'react';
import { MOCK_USERS, INITIAL_NOTE_CONTENT } from './constants';
import { Note, User, Permission, Notification } from './types';
import { Editor } from './components/Editor';
import { MindMap } from './components/MindMap';
import { Auth } from './components/Auth';
import { Button, Avatar, Modal, Tooltip, Input } from './components/UI';

// --- Icons ---
const SidebarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="9" x2="9" y1="3" y2="21"/></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>;
const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>;
const BrainIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.97-3.465"/><path d="M20 14.535A4 4 0 0 1 18 18"/></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 18 18"/></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>;
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/></svg>;
const LogOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>;

export default function App() {
  // --- State ---
  // Start with null to show Login Screen
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS); 
  const [notes, setNotes] = useState<Note[]>(() => {
    return [{
      id: 'note_welcome',
      title: 'Welcome to Juhi',
      content: INITIAL_NOTE_CONTENT,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ownerId: MOCK_USERS[0].id,
      sharedWith: []
    }];
  });
  const [openNoteIds, setOpenNoteIds] = useState<string[]>(['note_welcome']);
  const [activeNoteId, setActiveNoteId] = useState<string>('note_welcome');
  const [viewMode, setViewMode] = useState<'editor' | 'mindmap'>('editor');
  
  // Modals & Notifications
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [inviteInput, setInviteInput] = useState('');

  // --- Derived State ---
  const activeNote = notes.find(n => n.id === activeNoteId);
  // Filter notes based on current user (if logged in)
  const myNotes = currentUser ? notes.filter(n => n.ownerId === currentUser.id) : [];
  const sharedNotes = currentUser ? notes.filter(n => n.ownerId !== currentUser.id && n.sharedWith.some(s => s.userId === currentUser.id)) : [];

  // --- Helpers ---
  const checkPermission = (note: Note, user: User): Permission | null => {
    if (note.ownerId === user.id) return 'owner';
    const share = note.sharedWith.find(s => s.userId === user.id);
    return share ? share.permission : null;
  };

  const notify = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type, timestamp: Date.now() }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const closeNoteTab = (noteId: string) => {
    const newOpenIds = openNoteIds.filter(id => id !== noteId);
    setOpenNoteIds(newOpenIds);
    if (activeNoteId === noteId) {
      setActiveNoteId(newOpenIds.length > 0 ? newOpenIds[newOpenIds.length - 1] : '');
    }
  };

  // --- Actions ---
  const handleLogin = (user: User) => {
      setCurrentUser(user);
      // If user not in list, add them (for mock purposes)
      if (!users.find(u => u.id === user.id)) {
          setUsers(prev => [...prev, user]);
      }
      notify(`Welcome back, ${user.name}`);
  };

  const handleLogout = () => {
      setCurrentUser(null);
      setOpenNoteIds([]);
      setActiveNoteId('');
  };

  const handleCreateNote = () => {
    if (!currentUser) return;
    const newNote: Note = {
      id: `note_${Date.now()}`,
      title: '',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ownerId: currentUser.id,
      sharedWith: []
    };
    setNotes(prev => [newNote, ...prev]);
    setOpenNoteIds(prev => [...prev, newNote.id]);
    setActiveNoteId(newNote.id);
    setViewMode('editor');
  };

  const handleRequestDelete = (noteId: string) => {
    setDeleteId(noteId);
  };

  const executeDelete = () => {
    if (!deleteId || !currentUser) return;
    
    const note = notes.find(n => n.id === deleteId);
    if (note) {
        if (note.ownerId === currentUser.id) {
           setNotes(prev => prev.filter(n => n.id !== deleteId));
           notify("Note deleted permanently", "success");
        } else {
           const updatedNote = {
              ...note,
              sharedWith: note.sharedWith.filter(s => s.userId !== currentUser.id)
           };
           setNotes(prev => prev.map(n => n.id === deleteId ? updatedNote : n));
           notify("Removed from shared notes", "success");
        }
        closeNoteTab(deleteId);
    }
    setDeleteId(null);
  };

  const handleUpdateNote = (updatedNote: Note) => {
    if (!currentUser) return;
    const perm = checkPermission(updatedNote, currentUser);
    if (!perm || perm === 'read') {
      notify("You don't have permission to edit this note", "warning");
      return;
    }
    setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
  };

  const handleOpenNote = (noteId: string) => {
    if (!openNoteIds.includes(noteId)) {
      setOpenNoteIds(prev => [...prev, noteId]);
    }
    setActiveNoteId(noteId);
    setViewMode('editor');
  };

  const handleCloseTab = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    closeNoteTab(noteId);
  };

  const handleShare = (userId: string, permission: Permission) => {
    if (!activeNote) return;
    const existingShare = activeNote.sharedWith.find(s => s.userId === userId);
    let newSharedWith = [...activeNote.sharedWith];
    
    if (existingShare) {
       if (existingShare.permission === permission) return; 
       newSharedWith = newSharedWith.map(s => s.userId === userId ? { ...s, permission } : s);
    } else {
       newSharedWith.push({ userId, permission });
    }
    const updatedNote = { ...activeNote, sharedWith: newSharedWith };
    setNotes(prev => prev.map(n => n.id === activeNote.id ? updatedNote : n));
    notify(`Note shared successfully`, "success");
  };

  const handleInviteExternal = () => {
    if (!inviteInput.trim()) return;
    let userToShare = users.find(u => u.email === inviteInput || u.id === inviteInput);
    if (!userToShare) {
       const newUser: User = {
          id: inviteInput,
          name: inviteInput.split('@')[0], 
          email: inviteInput.includes('@') ? inviteInput : '',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(inviteInput)}&background=random`
       };
       setUsers(prev => [...prev, newUser]);
       userToShare = newUser;
    }
    handleShare(userToShare.id, 'read'); 
    setInviteInput('');
  };

  const handleShareWhatsApp = () => {
     if (!activeNote) return;
     const text = encodeURIComponent(`Check out my note "${activeNote.title || 'Untitled'}":\n\n${activeNote.content}`);
     window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const removeShare = (userId: string) => {
      if (!activeNote) return;
      const updatedNote = { ...activeNote, sharedWith: activeNote.sharedWith.filter(s => s.userId !== userId) };
      setNotes(prev => prev.map(n => n.id === activeNote.id ? updatedNote : n));
  };

  // --- Auth Guard ---
  if (!currentUser) {
      return (
        <>
            <Auth onLogin={handleLogin} />
            {/* Notifications Container for Auth Screen */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-2 pointer-events-none z-50">
                {notifications.map(n => (
                <div key={n.id} className="bg-white border border-slate-200 shadow-lg rounded-lg px-4 py-3 text-sm text-slate-700 flex items-center gap-3 animate-in slide-in-from-right-10 fade-in duration-300">
                    {n.type === 'success' && <div className="text-green-500"><CheckIcon /></div>}
                    {n.message}
                </div>
                ))}
            </div>
        </>
      );
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-800 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 z-20">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 font-serif font-bold text-xl text-slate-900">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <span className="text-lg">J</span>
            </div>
            Juhi
          </div>
        </div>

        <div className="p-3">
          <Button onClick={handleCreateNote} className="w-full justify-start shadow-none bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100" icon={<PlusIcon />}>
            New Note
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          {/* My Notes */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">My Notes</h3>
            <div className="space-y-0.5">
              {myNotes.length === 0 ? (
                 <p className="text-xs text-slate-400 italic px-3">No notes yet.</p>
              ) : (
                myNotes.map(note => (
                    <div key={note.id} className="group flex items-center gap-1 hover:bg-slate-50 rounded-md pr-1 transition-colors">
                    <button
                        onClick={() => handleOpenNote(note.id)}
                        className={`flex-1 text-left px-3 py-2 text-sm truncate rounded-md transition-colors ${activeNoteId === note.id ? 'text-indigo-700 font-medium bg-slate-100' : 'text-slate-600'}`}
                    >
                        {note.title || 'Untitled Note'}
                    </button>
                    <button
                        onClick={(e) => { 
                        e.stopPropagation(); 
                        handleRequestDelete(note.id); 
                        }}
                        className={`p-1.5 rounded-md transition-all ${activeNoteId === note.id ? 'opacity-100 text-slate-400 hover:text-red-600 hover:bg-red-50' : 'opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 hover:bg-red-50 focus:opacity-100'}`}
                        title="Delete Note"
                    >
                        <TrashIcon />
                    </button>
                    </div>
                ))
              )}
            </div>
          </div>

          {/* Shared Notes */}
          {sharedNotes.length > 0 && (
            <div>
              <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Shared with Me</h3>
              <div className="space-y-0.5">
                {sharedNotes.map(note => (
                  <div key={note.id} className="group flex items-center gap-1 hover:bg-slate-50 rounded-md pr-1 transition-colors">
                     <button
                        onClick={() => handleOpenNote(note.id)}
                        className={`flex-1 text-left px-3 py-2 text-sm truncate rounded-md transition-colors ${activeNoteId === note.id ? 'text-indigo-700 font-medium bg-slate-100' : 'text-slate-600'}`}
                     >
                        {note.title || 'Untitled Note'}
                     </button>
                     <button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handleRequestDelete(note.id); 
                        }}
                        className={`p-1.5 rounded-md transition-all ${activeNoteId === note.id ? 'opacity-100 text-slate-400 hover:text-red-600 hover:bg-red-50' : 'opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 hover:bg-red-50 focus:opacity-100'}`}
                        title="Remove Note"
                      >
                        <TrashIcon />
                      </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <Avatar url={currentUser.avatar} name={currentUser.name} size="md" />
            <div className="flex-1 overflow-hidden">
               <p className="text-sm font-medium text-slate-700 truncate">{currentUser.name}</p>
               <p className="text-xs text-slate-500 truncate">{currentUser.email || 'Mobile User'}</p>
            </div>
            <Tooltip text="Log Out">
                <button 
                    onClick={handleLogout}
                    className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-200/50 transition-colors"
                >
                    <LogOutIcon />
                </button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        
        {/* Top Bar / Tabs */}
        <div className="h-12 border-b border-slate-200 flex items-center bg-slate-50/80 backdrop-blur-sm px-2 gap-1 overflow-x-auto no-scrollbar">
          {openNoteIds.map(id => {
            const note = notes.find(n => n.id === id);
            if (!note) return null;
            const isActive = activeNoteId === id;
            return (
              <div
                key={id}
                onClick={() => setActiveNoteId(id)}
                className={`
                  group flex items-center gap-2 px-3 py-1.5 rounded-t-lg border-t border-x border-transparent cursor-pointer min-w-[120px] max-w-[200px]
                  ${isActive ? 'bg-white border-slate-200 !border-b-white translate-y-[1px] shadow-sm' : 'hover:bg-slate-200/50 text-slate-500'}
                `}
              >
                <span className={`text-sm truncate flex-1 ${isActive ? 'font-medium text-slate-800' : ''}`}>{note.title || 'Untitled'}</span>
                <button
                  onClick={(e) => handleCloseTab(e, id)}
                  className={`opacity-0 group-hover:opacity-100 hover:bg-slate-200 p-0.5 rounded ${isActive ? 'opacity-100' : ''}`}
                >
                  <XIcon />
                </button>
              </div>
            );
          })}
        </div>

        {/* Toolbar */}
        {activeNote && (
          <div className="h-14 border-b border-slate-100 flex items-center justify-between px-6 bg-white">
            <div className="flex items-center gap-2 text-sm text-slate-500">
               <span>Last edited {new Date(activeNote.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
               {activeNote.sharedWith.length > 0 && (
                 <div className="flex items-center gap-1 ml-4 bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full text-xs">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                    Shared
                 </div>
               )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => setViewMode('editor')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${viewMode === 'editor' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Editor
                </button>
                <button 
                  onClick={() => setViewMode('mindmap')}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${viewMode === 'mindmap' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <BrainIcon />
                  Mind Map
                </button>
              </div>

              <div className="h-6 w-px bg-slate-200 mx-2"></div>

              {activeNote.ownerId === currentUser.id ? (
                <>
                  <Button variant="secondary" onClick={() => setShareModalOpen(true)} icon={<ShareIcon />}>
                    Share
                  </Button>
                  <Tooltip text="Delete Note">
                    <Button variant="ghost" onClick={() => handleRequestDelete(activeNote.id)} className="text-red-500 hover:bg-red-50 hover:text-red-600 px-2" icon={<TrashIcon />}>
                    </Button>
                  </Tooltip>
                </>
              ) : (
                  <div className="flex items-center gap-3">
                     <Tooltip text="Remove Note">
                       <Button variant="ghost" onClick={() => handleRequestDelete(activeNote.id)} className="text-red-500 hover:bg-red-50 hover:text-red-600 px-2" icon={<TrashIcon />}>
                       </Button>
                     </Tooltip>
                     <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
                       <span className="text-xs text-slate-500">Owner:</span>
                       <Avatar 
                          url={users.find(u => u.id === activeNote.ownerId)?.avatar || ''} 
                          name="Owner" 
                          size="sm" 
                       />
                    </div>
                  </div>
              )}
            </div>
          </div>
        )}

        {/* Workspace */}
        <div className="flex-1 overflow-hidden relative">
          {activeNote ? (
            viewMode === 'editor' ? (
              <div className="h-full overflow-y-auto">
                 <Editor 
                   note={activeNote} 
                   currentUser={currentUser}
                   onUpdate={handleUpdateNote}
                   readOnly={checkPermission(activeNote, currentUser) === 'read'}
                 />
              </div>
            ) : (
              <MindMap note={activeNote} onClose={() => setViewMode('editor')} />
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl mb-4 flex items-center justify-center">
                <SidebarIcon />
              </div>
              <p>Select a note or create a new one</p>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 pointer-events-none z-50">
        {notifications.map(n => (
          <div key={n.id} className="bg-white border border-slate-200 shadow-lg rounded-lg px-4 py-3 text-sm text-slate-700 flex items-center gap-3 animate-in slide-in-from-right-10 fade-in duration-300">
            {n.type === 'success' && <div className="text-green-500"><CheckIcon /></div>}
            {n.type === 'warning' && <div className="text-amber-500">!</div>}
            {n.message}
          </div>
        ))}
      </div>

      {/* Share Modal */}
      <Modal isOpen={shareModalOpen} onClose={() => { setShareModalOpen(false); setInviteInput(''); }} title="Share Note">
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Invite by Email or Phone</p>
            <div className="flex gap-2">
              <Input 
                placeholder="email@example.com or +123456789" 
                value={inviteInput} 
                onChange={(e) => setInviteInput(e.target.value)}
              />
              <Button onClick={handleInviteExternal} disabled={!inviteInput.trim()}>
                Invite
              </Button>
            </div>
          </div>

           <div className="space-y-2">
             <Button variant="secondary" className="w-full justify-center gap-2 text-[#25D366] hover:bg-[#25D366]/5 hover:text-[#25D366] border-[#25D366]/30" onClick={handleShareWhatsApp}>
               <WhatsAppIcon />
               Share via WhatsApp
             </Button>
           </div>
          
          <div className="h-px bg-slate-100 w-full my-4"></div>

          <div className="space-y-3">
             <p className="text-sm font-medium text-slate-700">Collaborators</p>
             {users.filter(u => u.id !== currentUser.id).map(user => {
               const shared = activeNote?.sharedWith.find(s => s.userId === user.id);
               return (
                 <div key={user.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3 overflow-hidden">
                       <Avatar url={user.avatar} name={user.name} />
                       <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{user.name}</p>
                          {user.email && <p className="text-xs text-slate-400 truncate">{user.email}</p>}
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                       {shared ? (
                         <>
                            <select 
                              value={shared.permission}
                              onChange={(e) => handleShare(user.id, e.target.value as Permission)}
                              className="text-xs border-none bg-transparent font-medium text-slate-600 focus:ring-0 cursor-pointer"
                            >
                              <option value="read">Read</option>
                              <option value="write">Write</option>
                            </select>
                            <button onClick={() => removeShare(user.id)} className="text-slate-400 hover:text-red-500">
                               <XIcon />
                            </button>
                         </>
                       ) : (
                         <Button variant="secondary" onClick={() => handleShare(user.id, 'read')} className="px-2 py-1 text-xs">
                           Invite
                         </Button>
                       )}
                    </div>
                 </div>
               );
             })}
          </div>

          <div className="pt-2 flex justify-end">
            <Button variant="primary" onClick={() => setShareModalOpen(false)}>Done</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        title="Delete Note"
      >
        <div className="space-y-4">
           <div className="flex items-center gap-4 bg-red-50 p-4 rounded-lg text-red-800 border border-red-100">
              <div className="bg-red-100 p-2 rounded-full flex-shrink-0">
                <TrashIcon />
              </div>
              <p className="text-sm">
                 Are you sure you want to delete this note? This action cannot be undone.
              </p>
           </div>
           
           <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setDeleteId(null)}>
                 Cancel
              </Button>
              <Button variant="danger" onClick={executeDelete}>
                 Delete Permanently
              </Button>
           </div>
        </div>
      </Modal>

    </div>
  );
}