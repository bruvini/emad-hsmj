
import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, Pencil, Trash2, Eye } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import UserFormDialog from '@/components/UserFormDialog';
import UserViewDialog from '@/components/UserViewDialog';
import { UserFormData } from '@/schemas/userSchema';

const GestaoUsuariosPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'usuariosEMAD'));
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const checkDuplicates = async (matricula: string, username: string, userId?: string) => {
    try {
      // Verificar matrícula
      const matriculaQuery = query(
        collection(db, 'usuariosEMAD'),
        where('matricula', '==', matricula)
      );
      const matriculaSnapshot = await getDocs(matriculaQuery);
      
      // Verificar username
      const usernameQuery = query(
        collection(db, 'usuariosEMAD'),
        where('username', '==', username)
      );
      const usernameSnapshot = await getDocs(usernameQuery);

      const matriculaExists = matriculaSnapshot.docs.some(doc => doc.id !== userId);
      const usernameExists = usernameSnapshot.docs.some(doc => doc.id !== userId);

      if (matriculaExists) {
        toast.error('Já existe um usuário com essa matrícula');
        return true;
      }

      if (usernameExists) {
        toast.error('Já existe um usuário com esse nome de usuário');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao verificar duplicatas:', error);
      toast.error('Erro ao verificar dados');
      return true;
    }
  };

  const handleSaveUser = async (userData: UserFormData) => {
    setIsSubmitting(true);
    
    try {
      // Transformar nome para maiúsculas
      const transformedData = {
        ...userData,
        nomeCompleto: userData.nomeCompleto.toUpperCase(),
        username: userData.username.toLowerCase()
      };

      // Verificar duplicatas
      const hasDuplicates = await checkDuplicates(
        transformedData.matricula,
        transformedData.username,
        editingUser?.id
      );

      if (hasDuplicates) {
        setIsSubmitting(false);
        return;
      }

      if (editingUser) {
        // Atualizar usuário existente
        await updateDoc(doc(db, 'usuariosEMAD', editingUser.id), transformedData);
        toast.success('Usuário atualizado com sucesso!');
      } else {
        // Criar novo usuário
        const email = `${transformedData.username}@emad.hmsj`;
        const userCredential = await createUserWithEmailAndPassword(auth, email, 'emad123');
        
        const userDataWithAuth = {
          ...transformedData,
          uid: userCredential.user.uid,
          email
        };

        await addDoc(collection(db, 'usuariosEMAD'), userDataWithAuth);
        toast.success('Usuário criado com sucesso!');
      }

      setShowFormDialog(false);
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      toast.error('Erro ao salvar usuário');
    }
    
    setIsSubmitting(false);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowFormDialog(true);
  };

  const handleView = (user) => {
    setViewingUser(user);
    setShowViewDialog(true);
  };

  const handleDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      // Remover do Firestore
      await deleteDoc(doc(db, 'usuariosEMAD', userToDelete.id));
      
      // Se tiver uid do Auth, tentar remover do Firebase Auth também
      if (userToDelete.uid) {
        try {
          // Nota: Para deletar usuário do Auth em produção, você precisará de uma Cloud Function
          // pois o cliente só pode deletar o próprio usuário
          console.log('Para deletar do Auth, implemente uma Cloud Function');
        } catch (authError) {
          console.warn('Erro ao remover do Auth:', authError);
        }
      }

      toast.success('Usuário removido com sucesso!');
      loadUsers();
    } catch (error) {
      console.error('Erro ao remover usuário:', error);
      toast.error('Erro ao remover usuário');
    }
    
    setShowDeleteDialog(false);
    setUserToDelete(null);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestão de Usuários</h1>
          <p className="text-muted-foreground">Gerencie os usuários do sistema</p>
        </div>
        <Button onClick={() => setShowFormDialog(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Adicionar Usuário
        </Button>
      </div>

      <div className="bg-card rounded-lg shadow-sm border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome Completo</TableHead>
              <TableHead>Tipo de Acesso</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2 text-muted-foreground">Carregando...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  Nenhum usuário encontrado
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.nomeCompleto}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.tipoDeAcesso === 'ADMIN' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.tipoDeAcesso}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(user)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(user)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Form Dialog */}
      <UserFormDialog
        isOpen={showFormDialog}
        onClose={() => {
          setShowFormDialog(false);
          setEditingUser(null);
        }}
        onSubmit={handleSaveUser}
        user={editingUser}
        isLoading={isSubmitting}
      />

      {/* View Dialog */}
      <UserViewDialog
        isOpen={showViewDialog}
        onClose={() => {
          setShowViewDialog(false);
          setViewingUser(null);
        }}
        user={viewingUser}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o usuário <strong>{userToDelete?.nomeCompleto}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GestaoUsuariosPage;
