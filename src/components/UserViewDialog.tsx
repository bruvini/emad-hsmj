
import React from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface UserViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

const UserViewDialog: React.FC<UserViewDialogProps> = ({ isOpen, onClose, user }) => {
  if (!user) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Detalhes do Usuário</AlertDialogTitle>
        </AlertDialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Matrícula</label>
            <p className="text-sm">{user.matricula}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Nome Completo</label>
            <p className="text-sm">{user.nomeCompleto}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Cargo</label>
            <p className="text-sm">{user.cargo}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Nome de Usuário</label>
            <p className="text-sm">{user.username}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Tipo de Acesso</label>
            <div className="mt-1">
              <Badge variant={user.tipoDeAcesso === 'ADMIN' ? 'default' : 'secondary'}>
                {user.tipoDeAcesso}
              </Badge>
            </div>
          </div>
          
          {user.tipoDeAcesso === 'Comum' && user.paginasAcessiveis && user.paginasAcessiveis.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Páginas Acessíveis</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {user.paginasAcessiveis.map((page: string) => (
                  <Badge key={page} variant="outline">{page}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UserViewDialog;
