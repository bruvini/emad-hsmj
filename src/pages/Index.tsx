
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  BedDouble, 
  Stethoscope, 
  LayoutDashboard,
  UserPlus,
  Pencil,
  Trash2,
  Menu,
  X,
  LogOut,
  Activity,
  Calendar,
  AlertCircle,
  TrendingUp,
  Plus,
  Search,
  Eye
} from 'lucide-react';

// Simulando Firebase (será substituído pela implementação real)
const mockFirebase = {
  auth: {
    createUserWithEmailAndPassword: async (email, password) => {
      return { user: { uid: `uid_${Date.now()}` } };
    },
    signInWithEmailAndPassword: async (email, password) => {
      return { user: { uid: 'current_user' } };
    }
  },
  firestore: {
    collection: (name) => ({
      add: async (data) => ({ id: `${name}_${Date.now()}` }),
      get: async () => ({
        docs: name === 'users' ? [
          { id: '1', data: () => ({ nome: 'Dr. João Silva', email: 'joao@hmsj.com', perfil: 'Admin' }) },
          { id: '2', data: () => ({ nome: 'Enf. Maria Santos', email: 'maria@hmsj.com', perfil: 'Equipe' }) }
        ] : [
          { id: '1', data: () => ({ nomeCompleto: 'José da Silva', cpf: '123.456.789-00', dataNascimento: '1980-05-15', status: 'Ativo' }) },
          { id: '2', data: () => ({ nomeCompleto: 'Ana Carolina', cpf: '987.654.321-00', dataNascimento: '1975-12-03', status: 'Ativo' }) }
        ]
      }),
      doc: (id) => ({
        update: async (data) => ({}),
        delete: async () => ({})
      })
    })
  }
};

// Componentes
const LoadingSpinner = () => (
  <div className="loading-spinner"></div>
);

const Toast = ({ message, type, onClose }) => (
  <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg animate-fade-in ${
    type === 'success' ? 'bg-green-500 text-white' : 
    type === 'error' ? 'bg-red-500 text-white' : 
    'bg-blue-500 text-white'
  }`}>
    <div className="flex items-center justify-between">
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 p-1 hover:bg-white/20 rounded">
        <X size={16} />
      </button>
    </div>
  </div>
);

const IconButton = ({ icon: Icon, onClick, title, variant = 'default', size = 'sm' }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-lg transition-all duration-200 focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    default: "bg-gray-100 hover:bg-gray-200 text-gray-700 focus:ring-gray-500",
    primary: "bg-medical-blue hover:bg-medical-blue-dark text-white focus:ring-medical-blue",
    danger: "bg-red-100 hover:bg-red-200 text-red-700 focus:ring-red-500"
  };

  const sizes = {
    sm: "p-2",
    md: "p-3"
  };

  return (
    <button
      onClick={onClick}
      title={title}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]}`}
    >
      <Icon size={size === 'sm' ? 16 : 20} />
    </button>
  );
};

const DashboardCard = ({ title, icon: Icon, onClick, description }) => (
  <div 
    onClick={onClick}
    className="card-medical p-6 cursor-pointer hover:scale-105 transform transition-all duration-200"
  >
    <div className="flex items-center mb-4">
      <div className="p-3 bg-medical-blue-light rounded-lg">
        <Icon className="text-medical-blue" size={24} />
      </div>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

const DataTable = ({ columns, data, onEdit, onDelete, loading }) => (
  <div className="card-medical overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {column.label}
              </th>
            ))}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={columns.length + 1} className="px-6 py-8 text-center">
                <div className="flex items-center justify-center">
                  <LoadingSpinner />
                  <span className="ml-2 text-gray-500">Carregando...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="px-6 py-8 text-center text-gray-500">
                Nenhum registro encontrado
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item[column.key]}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex space-x-2">
                    <IconButton
                      icon={Pencil}
                      onClick={() => onEdit(item)}
                      title="Editar"
                      variant="primary"
                    />
                    <IconButton
                      icon={Trash2}
                      onClick={() => onDelete(item)}
                      title="Excluir"
                      variant="danger"
                    />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>
        
        <div className={`inline-block align-bottom bg-white rounded-lg shadow-xl transform transition-all sm:my-8 sm:align-middle w-full ${sizes[size]}`}>
          <div className="bg-white px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <IconButton
                icon={X}
                onClick={onClose}
                title="Fechar"
              />
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ currentPage, onPageChange, isOpen, onToggle }) => {
  const menuItems = [
    { id: 'home', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'users', label: 'Gestão de Usuários', icon: Users },
    { id: 'patients', label: 'Gerenciar Pacientes', icon: BedDouble },
    { id: 'appointments', label: 'Lançar Atendimentos', icon: Stethoscope },
    { id: 'dashboard', label: 'Dashboard Estratégico', icon: TrendingUp }
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}
      
      <div className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-medical-blue">EMAD</h2>
                <p className="text-sm text-gray-600">Hospital São José</p>
              </div>
              <button 
                onClick={onToggle}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onPageChange(item.id);
                  if (window.innerWidth < 768) onToggle();
                }}
                className={`sidebar-item ${currentPage === item.id ? 'sidebar-item-active' : ''}`}
              >
                <item.icon size={20} className="mr-3" />
                <span>{item.label}</span>
              </div>
            ))}
          </nav>
          
          <div className="p-4 border-t border-gray-200">
            <div className="sidebar-item">
              <LogOut size={20} className="mr-3" />
              <span>Sair</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Header = ({ onToggleSidebar }) => (
  <header className="bg-white border-b border-gray-200 px-6 py-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 mr-4"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Sistema EMAD - HMSJ</h1>
          <p className="text-sm text-gray-600">Equipe Multi de Atendimento Domiciliar</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-900">Dr. João Silva</p>
          <p className="text-xs text-gray-600">Coordenador EMAD</p>
        </div>
        <div className="w-8 h-8 bg-medical-blue rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">JS</span>
        </div>
      </div>
    </div>
  </header>
);

// Páginas
const HomePage = ({ onNavigate }) => (
  <div className="animate-fade-in">
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Visão Geral - EMAD HMSJ</h1>
      <p className="text-gray-600">Bem-vindo(a) ao sistema de gestão da Equipe Multi de Atendimento Domiciliar</p>
    </div>

    {/* Indicadores Rápidos */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="card-medical p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Pacientes Ativos</p>
            <p className="text-2xl font-bold text-gray-900">42</p>
          </div>
          <Activity className="text-medical-blue" size={24} />
        </div>
      </div>

      <div className="card-medical p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Atendimentos no Mês</p>
            <p className="text-2xl font-bold text-gray-900">156</p>
          </div>
          <Calendar className="text-green-600" size={24} />
        </div>
      </div>

      <div className="card-medical p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Novas Admissões</p>
            <p className="text-2xl font-bold text-gray-900">8</p>
          </div>
          <TrendingUp className="text-blue-600" size={24} />
        </div>
      </div>

      <div className="card-medical p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Alertas</p>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
          <AlertCircle className="text-yellow-600" size={24} />
        </div>
      </div>
    </div>

    {/* Alertas */}
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Alertas Recentes</h2>
      <div className="card-medical p-6">
        <p className="text-gray-600 text-center">Nenhum alerta novo</p>
      </div>
    </div>

    {/* Grid de Navegação */}
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Acesso Rápido</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Gestão de Usuários"
          icon={Users}
          description="Gerenciar usuários do sistema"
          onClick={() => onNavigate('users')}
        />
        <DashboardCard
          title="Gerenciar Pacientes"
          icon={BedDouble}
          description="Cadastro e acompanhamento"
          onClick={() => onNavigate('patients')}
        />
        <DashboardCard
          title="Lançar Atendimentos"
          icon={Stethoscope}
          description="Registrar atendimentos"
          onClick={() => onNavigate('appointments')}
        />
        <DashboardCard
          title="Dashboard Estratégico"
          icon={LayoutDashboard}
          description="Relatórios e indicadores"
          onClick={() => onNavigate('dashboard')}
        />
      </div>
    </div>
  </div>
);

const LoginPage = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div className="max-w-md w-full">
      <div className="card-medical p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">EMAD - HMSJ</h1>
          <p className="text-gray-600 mt-2">Acesse sua conta</p>
        </div>
        
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              className="input-medical"
              placeholder="seu.email@hmsj.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              type="password"
              className="input-medical"
              placeholder="••••••••"
            />
          </div>
          
          <button type="submit" className="btn-primary w-full">
            Entrar
          </button>
        </form>
      </div>
    </div>
  </div>
);

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const querySnapshot = await mockFirebase.firestore.collection('users').get();
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
    } catch (error) {
      showToast('Erro ao carregar usuários', 'error');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await mockFirebase.firestore.collection('users').doc(userToDelete.id).delete();
      showToast('Usuário removido com sucesso', 'success');
      loadUsers();
    } catch (error) {
      showToast('Erro ao remover usuário', 'error');
    }
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleSaveUser = async (userData) => {
    try {
      if (editingUser) {
        await mockFirebase.firestore.collection('users').doc(editingUser.id).update(userData);
        showToast('Usuário atualizado com sucesso', 'success');
      } else {
        await mockFirebase.auth.createUserWithEmailAndPassword(userData.email, userData.senha);
        await mockFirebase.firestore.collection('users').add({
          nome: userData.nome,
          email: userData.email,
          perfil: userData.perfil
        });
        showToast('Usuário criado com sucesso', 'success');
      }
      loadUsers();
      setShowModal(false);
      setEditingUser(null);
    } catch (error) {
      showToast('Erro ao salvar usuário', 'error');
    }
  };

  const columns = [
    { key: 'nome', label: 'Nome' },
    { key: 'email', label: 'Email' },
    { key: 'perfil', label: 'Perfil' }
  ];

  return (
    <div className="animate-fade-in">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Usuários</h1>
          <p className="text-gray-600">Gerencie os usuários do sistema</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center"
        >
          <UserPlus size={16} className="mr-2" />
          Adicionar Usuário
        </button>
      </div>

      <DataTable
        columns={columns}
        data={users}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingUser(null);
        }}
        title={editingUser ? 'Editar Usuário' : 'Adicionar Usuário'}
      >
        <UserForm
          user={editingUser}
          onSave={handleSaveUser}
          onCancel={() => {
            setShowModal(false);
            setEditingUser(null);
          }}
        />
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar Exclusão"
        size="sm"
      >
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Tem certeza que deseja remover o usuário <strong>{userToDelete?.nome}</strong>?
          </p>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDelete}
              className="btn-danger"
            >
              Excluir
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const UserForm = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    nome: user?.nome || '',
    email: user?.email || '',
    senha: '',
    perfil: user?.perfil || 'Equipe'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nome Completo
        </label>
        <input
          type="text"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          className="input-medical"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="input-medical"
          required
        />
      </div>

      {!user && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Senha
          </label>
          <input
            type="password"
            value={formData.senha}
            onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
            className="input-medical"
            required
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Perfil
        </label>
        <select
          value={formData.perfil}
          onChange={(e) => setFormData({ ...formData, perfil: e.target.value })}
          className="input-medical"
        >
          <option value="Admin">Administrador</option>
          <option value="Equipe">Equipe</option>
          <option value="Coordenador">Coordenador</option>
        </select>
      </div>

      <div className="flex space-x-3 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">
          Cancelar
        </button>
        <button type="submit" className="btn-primary flex-1">
          {user ? 'Atualizar' : 'Criar'} Usuário
        </button>
      </div>
    </form>
  );
};

const PatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadPatients = useCallback(async () => {
    setLoading(true);
    try {
      const querySnapshot = await mockFirebase.firestore.collection('patients').get();
      const patientsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPatients(patientsData);
    } catch (error) {
      showToast('Erro ao carregar pacientes', 'error');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setShowModal(true);
  };

  const handleDelete = (patient) => {
    setPatientToDelete(patient);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await mockFirebase.firestore.collection('patients').doc(patientToDelete.id).delete();
      showToast('Paciente removido com sucesso', 'success');
      loadPatients();
    } catch (error) {
      showToast('Erro ao remover paciente', 'error');
    }
    setShowDeleteModal(false);
    setPatientToDelete(null);
  };

  const handleSavePatient = async (patientData) => {
    try {
      if (editingPatient) {
        await mockFirebase.firestore.collection('patients').doc(editingPatient.id).update(patientData);
        showToast('Paciente atualizado com sucesso', 'success');
      } else {
        await mockFirebase.firestore.collection('patients').add(patientData);
        showToast('Paciente cadastrado com sucesso', 'success');
      }
      loadPatients();
      setShowModal(false);
      setEditingPatient(null);
    } catch (error) {
      showToast('Erro ao salvar paciente', 'error');
    }
  };

  const columns = [
    { key: 'nomeCompleto', label: 'Nome Completo' },
    { key: 'cpf', label: 'CPF' },
    { key: 'dataNascimento', label: 'Data de Nascimento' },
    { key: 'status', label: 'Status' }
  ];

  return (
    <div className="animate-fade-in">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Pacientes</h1>
          <p className="text-gray-600">Cadastro e acompanhamento de pacientes</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus size={16} className="mr-2" />
          Adicionar Paciente
        </button>
      </div>

      <DataTable
        columns={columns}
        data={patients}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingPatient(null);
        }}
        title={editingPatient ? 'Editar Paciente' : 'Adicionar Paciente'}
        size="lg"
      >
        <PatientForm
          patient={editingPatient}
          onSave={handleSavePatient}
          onCancel={() => {
            setShowModal(false);
            setEditingPatient(null);
          }}
        />
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar Exclusão"
        size="sm"
      >
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Tem certeza que deseja remover o paciente <strong>{patientToDelete?.nomeCompleto}</strong>?
          </p>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDelete}
              className="btn-danger"
            >
              Excluir
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const PatientForm = ({ patient, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    nomeCompleto: patient?.nomeCompleto || '',
    cpf: patient?.cpf || '',
    dataNascimento: patient?.dataNascimento || '',
    status: patient?.status || 'Ativo',
    telefone: patient?.telefone || '',
    endereco: patient?.endereco || '',
    diagnostico: patient?.diagnostico || '',
    observacoes: patient?.observacoes || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome Completo
          </label>
          <input
            type="text"
            value={formData.nomeCompleto}
            onChange={(e) => setFormData({ ...formData, nomeCompleto: e.target.value })}
            className="input-medical"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CPF
          </label>
          <input
            type="text"
            value={formData.cpf}
            onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
            className="input-medical"
            placeholder="000.000.000-00"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data de Nascimento
          </label>
          <input
            type="date"
            value={formData.dataNascimento}
            onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
            className="input-medical"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="input-medical"
          >
            <option value="Ativo">Ativo</option>
            <option value="Alta">Alta</option>
            <option value="Óbito">Óbito</option>
            <option value="Transferido">Transferido</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefone
          </label>
          <input
            type="tel"
            value={formData.telefone}
            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
            className="input-medical"
            placeholder="(47) 99999-9999"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Diagnóstico Principal
          </label>
          <input
            type="text"
            value={formData.diagnostico}
            onChange={(e) => setFormData({ ...formData, diagnostico: e.target.value })}
            className="input-medical"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Endereço
        </label>
        <input
          type="text"
          value={formData.endereco}
          onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
          className="input-medical"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observações
        </label>
        <textarea
          value={formData.observacoes}
          onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
          className="input-medical min-h-[100px]"
          rows={4}
        />
      </div>

      <div className="flex space-x-3 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">
          Cancelar
        </button>
        <button type="submit" className="btn-primary flex-1">
          {patient ? 'Atualizar' : 'Cadastrar'} Paciente
        </button>
      </div>
    </form>
  );
};

const AppointmentsPage = () => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="text-center">
      <Stethoscope className="mx-auto mb-4 text-medical-blue" size={48} />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Página de Atendimentos</h1>
      <p className="text-gray-600">Em desenvolvimento</p>
    </div>
  </div>
);

const DashboardPage = () => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="text-center">
      <TrendingUp className="mx-auto mb-4 text-medical-blue" size={48} />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Estratégico</h1>
      <p className="text-gray-600">Em desenvolvimento</p>
    </div>
  </div>
);

// Aplicação Principal
const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Simulando autenticação

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'login':
        return <LoginPage />;
      case 'users':
        return <UsersPage />;
      case 'patients':
        return <PatientsPage />;
      case 'appointments':
        return <AppointmentsPage />;
      case 'dashboard':
        return <DashboardPage />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          
          <main className="flex-1 overflow-y-auto p-6">
            {renderPage()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;
