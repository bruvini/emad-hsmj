
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

// Simulando Firebase (será substituído pela implementação real)
const mockFirebase = {
  firestore: {
    collection: (name) => ({
      add: async (data) => ({ id: `${name}_${Date.now()}` }),
      get: async () => ({
        docs: [
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

const LoadingSpinner = () => (
  <div className="inline-block w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
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
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
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

const DataTable = ({ columns, data, onEdit, onDelete, loading }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observações
        </label>
        <textarea
          value={formData.observacoes}
          onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
          rows={4}
        />
      </div>

      <div className="flex space-x-3 pt-4">
        <button type="button" onClick={onCancel} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Cancelar
        </button>
        <button type="submit" className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          {patient ? 'Atualizar' : 'Cadastrar'} Paciente
        </button>
      </div>
    </form>
  );
};

const PacientesPage = () => {
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
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
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
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Excluir
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PacientesPage;
