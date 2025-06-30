import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  User, 
  Sword, 
  Shield, 
  Zap, 
  Package, 
  Heart, 
  Brain, 
  Settings,
  LogOut,
  Plus,
  Minus,
  Edit,
  Trash2,
  RotateCcw,
  Save
} from 'lucide-react';

// Auth Context
const AuthContext = createContext();
const useAuth = () => useContext(AuthContext);

// Exemple complet :
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'thirsty-grass-production.up.railway.app/api'
  : 'http://localhost:3001/api';


const api = {
  auth: {
    login: async (email, password) => {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      return response.json();
    },
    register: async (email, password, username) => {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username })
      });
      return response.json();
    }
  },
  characters: {
    getAll: async (token) => {
      const response = await fetch(`${API_BASE}/characters`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.json();
    },
    getById: async (id, token) => {
      const response = await fetch(`${API_BASE}/characters/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.json();
    },
    create: async (character, token) => {
      const response = await fetch(`${API_BASE}/characters`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(character)
      });
      return response.json();
    },
    update: async (id, updates, token) => {
      const response = await fetch(`${API_BASE}/characters/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(updates)
      });
      return response.json();
    },
    updateResources: async (id, resources, token) => {
      const response = await fetch(`${API_BASE}/characters/${id}/resources`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(resources)
      });
      return response.json();
    },
    rest: async (id, restType, token) => {
      const response = await fetch(`${API_BASE}/characters/${id}/rest`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ restType })
      });
      return response.json();
    }
  },
  spells: {
    cast: async (spellId, token) => {
      const response = await fetch(`${API_BASE}/spells/${spellId}/cast`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.json();
    },
    create: async (characterId, spell, token) => {
      const response = await fetch(`${API_BASE}/characters/${characterId}/spells`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(spell)
      });
      return response.json();
    },
    update: async (spellId, updates, token) => {
      const response = await fetch(`${API_BASE}/spells/${spellId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(updates)
      });
      return response.json();
    },
    delete: async (spellId, token) => {
      const response = await fetch(`${API_BASE}/spells/${spellId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.json();
    }
  },
  items: {
    create: async (characterId, item, token) => {
      const response = await fetch(`${API_BASE}/characters/${characterId}/items`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(item)
      });
      return response.json();
    },
    toggleEquip: async (itemId, token) => {
      const response = await fetch(`${API_BASE}/items/${itemId}/toggle-equip`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.json();
    },
    update: async (itemId, updates, token) => {
      const response = await fetch(`${API_BASE}/items/${itemId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(updates)
      });
      return response.json();
    },
    delete: async (itemId, token) => {
      const response = await fetch(`${API_BASE}/items/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.json();
    }
  }
};

// Auth Provider
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Decode token to get user info (simple version)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
          setUser({ id: payload.sub });
        } else {
          localStorage.removeItem('token');
          setToken(null);
        }
      } catch (e) {
        localStorage.removeItem('token');
        setToken(null);
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    const result = await api.auth.login(email, password);
    if (result.session) {
      setToken(result.session.access_token);
      setUser(result.user);
      localStorage.setItem('token', result.session.access_token);
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const register = async (email, password, username) => {
    const result = await api.auth.register(email, password, username);
    if (result.session) {
      setToken(result.session.access_token);
      setUser(result.user);
      localStorage.setItem('token', result.session.access_token);
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Login Component
const LoginForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = isLogin 
      ? await login(email, password)
      : await register(email, password, username);
    
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          {isLogin ? 'Login' : 'Register'}
        </h2>
        
        {error && (
          <div className="bg-red-600 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 bg-gray-700 text-white rounded"
              required
            />
          )}
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-gray-700 text-white rounded"
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-gray-700 text-white rounded"
            required
          />
          
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded"
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        
        <p className="text-gray-400 text-center mt-4">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-400 hover:text-blue-300 ml-2"
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

// Character Selection Component
const CharacterSelect = ({ onCharacterSelect }) => {
  const [characters, setCharacters] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCharacter, setNewCharacter] = useState({
    name: '',
    race: '',
    class: '',
    level: 1,
    max_ap: 45,
    current_ap: 45,
    max_mp: 121,
    current_mp: 121,
    max_hex: 20,
    current_hex: 0,
    strength: 50,
    dexterity: 50,
    constitution: 50,
    intelligence: 50,
    wisdom: 50,
    charisma: 50
  });
  const { token, logout } = useAuth();

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    const result = await api.characters.getAll(token);
    if (Array.isArray(result)) {
      setCharacters(result);
    }
  };

  const createCharacter = async (e) => {
    e.preventDefault();
    const result = await api.characters.create(newCharacter, token);
    if (result.id) {
      setShowCreateForm(false);
      setNewCharacter({
        name: '',
        race: '',
        class: '',
        level: 1,
        max_ap: 45,
        current_ap: 45,
        max_mp: 121,
        current_mp: 121,
        max_hex: 20,
        current_hex: 0,
        strength: 50,
        dexterity: 50,
        constitution: 50,
        intelligence: 50,
        wisdom: 50,
        charisma: 50
      });
      loadCharacters();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Your Characters</h1>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map(character => (
            <div
              key={character.id}
              className="bg-gray-800 p-6 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
              onClick={() => onCharacterSelect(character)}
            >
              <h3 className="text-xl font-bold text-white mb-2">{character.name}</h3>
              <p className="text-gray-400">Level {character.level} {character.race} {character.class}</p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-400">AP</span>
                  <span className="text-white">{character.current_ap || 0}/{character.max_ap || 45}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-purple-400">MP</span>
                  <span className="text-white">{character.current_mp || 0}/{character.max_mp || 121}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-400">HEX</span>
                  <span className="text-white">{character.current_hex || 0}/{character.max_hex || 20}</span>
                </div>
              </div>
            </div>
          ))}

          <div 
            className="bg-gray-800 p-6 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center cursor-pointer hover:border-gray-500 transition-colors"
            onClick={() => setShowCreateForm(true)}
          >
            <div className="text-center">
              <Plus size={48} className="text-gray-500 mx-auto mb-2" />
              <p className="text-gray-500">Create New Character</p>
            </div>
          </div>
        </div>

        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-96 max-h-screen overflow-y-auto">
              <h3 className="text-xl font-bold text-white mb-4">Create Character</h3>
              <form onSubmit={createCharacter} className="space-y-4">
                <input
                  type="text"
                  placeholder="Name"
                  value={newCharacter.name}
                  onChange={(e) => setNewCharacter({...newCharacter, name: e.target.value})}
                  className="w-full p-3 bg-gray-700 text-white rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Race"
                  value={newCharacter.race}
                  onChange={(e) => setNewCharacter({...newCharacter, race: e.target.value})}
                  className="w-full p-3 bg-gray-700 text-white rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Class"
                  value={newCharacter.class}
                  onChange={(e) => setNewCharacter({...newCharacter, class: e.target.value})}
                  className="w-full p-3 bg-gray-700 text-white rounded"
                  required
                />
                <div className="flex gap-4">
                  <input
                    type="number"
                    placeholder="Level"
                    value={newCharacter.level}
                    onChange={(e) => setNewCharacter({...newCharacter, level: parseInt(e.target.value)})}
                    className="w-full p-3 bg-gray-700 text-white rounded"
                    min="1"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white p-3 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Resource Control Component (pour AP/MP/HEX avec +/-)
const ResourceControl = ({ label, current, max, color, onChange, character, updateCharacter }) => {
  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState(current);

  const handleDoubleClick = () => {
    setEditing(true);
    setTempValue(current);
  };

  const handleSave = () => {
    const newValue = Math.max(0, Math.min(max, parseInt(tempValue) || 0));
    onChange(newValue);
    setEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditing(false);
      setTempValue(current);
    }
  };

  const increment = () => {
    const newValue = Math.min(max, current + 1);
    onChange(newValue);
  };

  const decrement = () => {
    const newValue = Math.max(0, current - 1);
    onChange(newValue);
  };

  return (
    <div className="text-center">
      <div className={`text-${color}-400 font-semibold`}>{label}</div>
      <div className="flex items-center justify-center gap-1">
        <button
          onClick={decrement}
          className="bg-gray-600 hover:bg-gray-500 text-white w-6 h-6 rounded text-sm flex items-center justify-center"
        >
          <Minus size={12} />
        </button>
        
        {editing ? (
          <input
            type="number"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyPress}
            className="w-16 bg-gray-700 text-white text-center text-lg font-bold rounded px-1"
            autoFocus
          />
        ) : (
          <div 
            className="text-white text-lg font-bold cursor-pointer hover:bg-gray-700 px-2 py-1 rounded"
            onDoubleClick={handleDoubleClick}
          >
            {current}/{max}
          </div>
        )}
        
        <button
          onClick={increment}
          className="bg-gray-600 hover:bg-gray-500 text-white w-6 h-6 rounded text-sm flex items-center justify-center"
        >
          <Plus size={12} />
        </button>
      </div>
      
      <div className="w-20 bg-gray-700 rounded-full h-2 mt-1">
        <div 
          className={`bg-${color}-500 h-2 rounded-full transition-all`}
          style={{ width: `${Math.min(100, (current / max) * 100)}%` }}
        />
      </div>
    </div>
  );
};

// Main Character Sheet Component
const CharacterSheet = ({ character: initialCharacter, onBack }) => {
  const [character, setCharacter] = useState(initialCharacter);
  const [characterData, setCharacterData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    loadCharacterData();
  }, [character.id]);

  const loadCharacterData = async () => {
    const result = await api.characters.getById(character.id, token);
    if (result.character) {
      setCharacterData(result);
      setCharacter(result.character);
    }
    setLoading(false);
  };

  const updateCharacter = async (updates) => {
    const result = await api.characters.update(character.id, updates, token);
    if (result.id) {
      setCharacter(result);
    }
  };

  const updateResource = async (resourceType, value) => {
    const updates = { [resourceType]: value };
    const result = await api.characters.updateResources(character.id, updates, token);
    if (result.id) {
      setCharacter(result);
    }
  };

  const castSpell = async (spell) => {
    const result = await api.spells.cast(spell.id, token);
    if (result.success) {
      setCharacter(result.character);
      let message = `${spell.name} cast successfully!\nAP: -${result.spell_result.ap_spent}\nMP: -${result.spell_result.mp_spent}\nHEX: +${result.spell_result.hex_gained}`;
      if (result.spell_result.hex_overflow) {
        message += '\n⚠️ HEX overflow! Reset to 0';
      }
      alert(message);
    } else {
      alert(`Failed to cast: ${result.error}`);
    }
    return result;
  };

  const toggleEquipment = async (item) => {
    const result = await api.items.toggleEquip(item.id, token);
    if (result.item) {
      loadCharacterData(); // Reload to get updated equipment
    }
  };

  const rest = async (type) => {
    const result = await api.characters.rest(character.id, type, token);
    if (result.character) {
      setCharacter(result.character);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'spells', label: 'Spells', icon: Zap },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'equipment', label: 'Equipment', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 p-6 border-b border-gray-700">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">{character.name}</h1>
              <p className="text-gray-400">Level {character.level} {character.race} {character.class}</p>
            </div>
          </div>
          
          {/* Resource Bars with Controls */}
          <div className="flex gap-6">
            <ResourceControl
              label="AP"
              current={character.current_ap || 0}
              max={character.max_ap || 45}
              color="blue"
              onChange={(value) => updateResource('current_ap', value)}
              character={character}
              updateCharacter={updateCharacter}
            />
            
            <ResourceControl
              label="MP"
              current={character.current_mp || 0}
              max={character.max_mp || 121}
              color="purple"
              onChange={(value) => updateResource('current_mp', value)}
              character={character}
              updateCharacter={updateCharacter}
            />
            
            <ResourceControl
              label="HEX"
              current={character.current_hex || 0}
              max={character.max_hex || 20}
              color="red"
              onChange={(value) => updateResource('current_hex', value)}
              character={character}
              updateCharacter={updateCharacter}
            />
            
            <div className="flex gap-2">
              <button
                onClick={() => rest('short')}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
              >
                Short Rest
              </button>
              <button
                onClick={() => rest('long')}
                className="bg-green-700 hover:bg-green-800 text-white px-3 py-1 rounded text-sm"
              >
                Long Rest
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto">
          <nav className="flex">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400 bg-gray-700'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        {activeTab === 'overview' && (
          <OverviewTab character={character} updateCharacter={updateCharacter} />
        )}
        
        {activeTab === 'spells' && (
          <SpellsTab 
            spells={characterData?.spells || []} 
            character={character}
            castSpell={castSpell}
            onUpdate={loadCharacterData}
          />
        )}
        
        {activeTab === 'inventory' && (
          <InventoryTab 
            items={characterData?.items?.filter(item => !item.is_equipped) || []}
            character={character}
            onUpdate={loadCharacterData}
          />
        )}
        
        {activeTab === 'equipment' && (
          <EquipmentTab 
            items={characterData?.items || []}
            character={character}
            toggleEquipment={toggleEquipment}
            onUpdate={loadCharacterData}
          />
        )}
      </div>
    </div>
  );
};

// Editable Field Component
const EditableField = ({ label, value, onChange, type = "text", min, max }) => {
  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handleSave = () => {
    let newValue = tempValue;
    if (type === "number") {
      newValue = parseInt(tempValue) || 0;
      if (min !== undefined) newValue = Math.max(min, newValue);
      if (max !== undefined) newValue = Math.min(max, newValue);
    }
    onChange(newValue);
    setEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditing(false);
      setTempValue(value);
    }
  };

  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-400">{label}:</span>
      {editing ? (
        <input
          type={type}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyPress}
          className="bg-gray-700 text-white px-2 py-1 rounded text-right"
          autoFocus
        />
      ) : (
        <span 
          className="text-white cursor-pointer hover:bg-gray-700 px-2 py-1 rounded"
          onClick={() => { setEditing(true); setTempValue(value); }}
        >
          {value}
        </span>
      )}
    </div>
  );
};

// Overview Tab Component (Version Homebrew sans modificateurs)
const OverviewTab = ({ character, updateCharacter }) => {
  const [editMode, setEditMode] = useState(false);
  const [editedStats, setEditedStats] = useState(character);

  const saveChanges = () => {
    updateCharacter(editedStats);
    setEditMode(false);
  };

  const stats = [
    { key: 'strength', label: 'STR', color: 'red' },
    { key: 'dexterity', label: 'DEX', color: 'green' },
    { key: 'constitution', label: 'CON', color: 'orange' },
    { key: 'intelligence', label: 'INT', color: 'blue' },
    { key: 'wisdom', label: 'WIS', color: 'purple' },
    { key: 'charisma', label: 'CHA', color: 'pink' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Character Overview</h2>
        <button
          onClick={() => editMode ? saveChanges() : setEditMode(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          {editMode ? <Save size={16} /> : <Edit size={16} />}
          {editMode ? 'Save' : 'Edit'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Stats - Système Homebrew (1-100) */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Ability Scores (1-100)</h3>
          <div className="grid grid-cols-2 gap-4">
            {stats.map(stat => (
              <div key={stat.key} className="text-center">
                <div className={`text-${stat.color}-400 font-semibold`}>{stat.label}</div>
                {editMode ? (
                  <input
                    type="number"
                    value={editedStats[stat.key] || 50}
                    onChange={(e) => setEditedStats({
                      ...editedStats,
                      [stat.key]: parseInt(e.target.value) || 50
                    })}
                    className="w-16 bg-gray-700 text-white text-center rounded mt-1"
                    min="1"
                    max="100"
                  />
                ) : (
                  <div className="text-white text-xl font-bold">{character[stat.key] || 50}</div>
                )}
                {/* Pas de modificateur dans le système homebrew */}
              </div>
            ))}
          </div>
        </div>

        {/* Combat Stats */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Combat Stats</h3>
          <div className="space-y-3">
            <EditableField
              label="Hit Points"
              value={character.hit_points || 0}
              onChange={(value) => updateCharacter({ hit_points: value })}
              type="number"
              min={0}
            />
            <EditableField
              label="Armor Class"
              value={character.armor_class || 10}
              onChange={(value) => updateCharacter({ armor_class: value })}
              type="number"
              min={0}
            />
            <EditableField
              label="Initiative"
              value={character.initiative || 0}
              onChange={(value) => updateCharacter({ initiative: value })}
              type="number"
            />
            <EditableField
              label="Speed (meters)"
              value={character.speed_meters || 9}
              onChange={(value) => updateCharacter({ speed_meters: value })}
              type="number"
              min={0}
            />
            <EditableField
              label="Speed (squares)"
              value={character.speed_squares || 6}
              onChange={(value) => updateCharacter({ speed_squares: value })}
              type="number"
              min={0}
            />
          </div>
        </div>

        {/* Character Info */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Character Info</h3>
          <div className="space-y-3">
            <EditableField
              label="Race"
              value={character.race || ''}
              onChange={(value) => updateCharacter({ race: value })}
            />
            <EditableField
              label="Class"
              value={character.class || ''}
              onChange={(value) => updateCharacter({ class: value })}
            />
            <EditableField
              label="Level"
              value={character.level || 1}
              onChange={(value) => updateCharacter({ level: value })}
              type="number"
              min={1}
            />
            <EditableField
              label="Gold"
              value={character.gold || 0}
              onChange={(value) => updateCharacter({ gold: value })}
              type="number"
              min={0}
            />
            <EditableField
              label="Experience"
              value={character.experience || 0}
              onChange={(value) => updateCharacter({ experience: value })}
              type="number"
              min={0}
            />
          </div>
        </div>

        {/* Resources */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Max Resources</h3>
          <div className="space-y-3">
            <EditableField
              label="Max AP"
              value={character.max_ap || 45}
              onChange={(value) => updateCharacter({ max_ap: value })}
              type="number"
              min={0}
            />
            <EditableField
              label="Max MP"
              value={character.max_mp || 121}
              onChange={(value) => updateCharacter({ max_mp: value })}
              type="number"
              min={0}
            />
            <EditableField
              label="Max HEX"
              value={character.max_hex || 20}
              onChange={(value) => updateCharacter({ max_hex: value })}
              type="number"
              min={0}
            />
          </div>
        </div>

        {/* Background & Notes */}
        <div className="bg-gray-800 p-6 rounded-lg col-span-full md:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">Background & Notes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Background</label>
              <textarea
                value={character.background || ''}
                onChange={(e) => updateCharacter({ background: e.target.value })}
                className="w-full bg-gray-700 text-white p-2 rounded h-20"
                placeholder="Character background..."
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Personality Traits</label>
              <textarea
                value={character.personality_traits || ''}
                onChange={(e) => updateCharacter({ personality_traits: e.target.value })}
                className="w-full bg-gray-700 text-white p-2 rounded h-20"
                placeholder="Personality traits..."
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Ideals</label>
              <textarea
                value={character.ideals || ''}
                onChange={(e) => updateCharacter({ ideals: e.target.value })}
                className="w-full bg-gray-700 text-white p-2 rounded h-20"
                placeholder="Ideals..."
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Bonds</label>
              <textarea
                value={character.bonds || ''}
                onChange={(e) => updateCharacter({ bonds: e.target.value })}
                className="w-full bg-gray-700 text-white p-2 rounded h-20"
                placeholder="Bonds..."
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Flaws</label>
              <textarea
                value={character.flaws || ''}
                onChange={(e) => updateCharacter({ flaws: e.target.value })}
                className="w-full bg-gray-700 text-white p-2 rounded h-20"
                placeholder="Flaws..."
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Notes</label>
              <textarea
                value={character.notes || ''}
                onChange={(e) => updateCharacter({ notes: e.target.value })}
                className="w-full bg-gray-700 text-white p-2 rounded h-20"
                placeholder="Additional notes..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Spells Tab Component
const SpellsTab = ({ spells, character, castSpell, onUpdate }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSpell, setNewSpell] = useState({
    name: '',
    description: '',
    damage_dice: '',
    damage_type: '',
    ap_cost: 0,
    mp_cost: 0,
    hex_increment: 0,
    casting_time: '1 action',
    duration: 'instantaneous',
    range_distance: '30m',
    school: 'evocation'
  });
  const { token } = useAuth();

  const handleCastSpell = async (spell) => {
    if (character.current_ap < spell.ap_cost) {
      alert('Not enough AP!');
      return;
    }
    if (character.current_mp < spell.mp_cost) {
      alert('Not enough MP!');
      return;
    }

    await castSpell(spell);
  };

  const addSpell = async (e) => {
    e.preventDefault();
    const response = await api.spells.create(character.id, newSpell, token);
    
    if (response.id) {
      setShowAddForm(false);
      setNewSpell({
        name: '',
        description: '',
        damage_dice: '',
        damage_type: '',
        ap_cost: 0,
        mp_cost: 0,
        hex_increment: 0,
        casting_time: '1 action',
        duration: 'instantaneous',
        range_distance: '30m',
        school: 'evocation'
      });
      onUpdate();
    }
  };

  const deleteSpell = async (spellId) => {
    const response = await api.spells.delete(spellId, token);
    if (response.message) {
      onUpdate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Spells</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Plus size={16} />
          Add Spell
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {spells.map(spell => (
          <div key={spell.id} className="bg-gray-800 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-white">{spell.name}</h3>
              <div className="flex gap-1">
                <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                  {spell.school}
                </span>
                <button
                  onClick={() => deleteSpell(spell.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            
            <p className="text-gray-400 text-sm mb-3 line-clamp-3">{spell.description}</p>
            
            <div className="space-y-2 mb-4">
              {spell.damage_dice && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Damage:</span>
                  <span className="text-red-400">{spell.damage_dice} {spell.damage_type}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Range:</span>
                <span className="text-white">{spell.range_distance}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Casting:</span>
                <span className="text-white">{spell.casting_time}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Duration:</span>
                <span className="text-white">{spell.duration}</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-3 text-sm">
              <div className="flex gap-4">
                <span className="text-blue-400">AP: {spell.ap_cost}</span>
                <span className="text-purple-400">MP: {spell.mp_cost}</span>
                <span className="text-red-400">HEX: +{spell.hex_increment}</span>
              </div>
            </div>

            <button
              onClick={() => handleCastSpell(spell)}
              disabled={character.current_ap < spell.ap_cost || character.current_mp < spell.mp_cost}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 rounded flex items-center justify-center gap-2"
            >
              <Zap size={16} />
              Cast Spell
            </button>
          </div>
        ))}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">Add New Spell</h3>
            <form onSubmit={addSpell} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Spell Name"
                  value={newSpell.name}
                  onChange={(e) => setNewSpell({...newSpell, name: e.target.value})}
                  className="w-full p-3 bg-gray-700 text-white rounded"
                  required
                />
                <select
                  value={newSpell.school}
                  onChange={(e) => setNewSpell({...newSpell, school: e.target.value})}
                  className="w-full p-3 bg-gray-700 text-white rounded"
                >
                  <option value="evocation">Evocation</option>
                  <option value="abjuration">Abjuration</option>
                  <option value="conjuration">Conjuration</option>
                  <option value="divination">Divination</option>
                  <option value="enchantment">Enchantment</option>
                  <option value="illusion">Illusion</option>
                  <option value="necromancy">Necromancy</option>
                  <option value="transmutation">Transmutation</option>
                </select>
              </div>
              
              <textarea
                placeholder="Description"
                value={newSpell.description}
                onChange={(e) => setNewSpell({...newSpell, description: e.target.value})}
                className="w-full p-3 bg-gray-700 text-white rounded h-24"
                required
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Damage (e.g., 2d8+4)"
                  value={newSpell.damage_dice}
                  onChange={(e) => setNewSpell({...newSpell, damage_dice: e.target.value})}
                  className="w-full p-3 bg-gray-700 text-white rounded"
                />
                <input
                  type="text"
                  placeholder="Damage Type"
                  value={newSpell.damage_type}
                  onChange={(e) => setNewSpell({...newSpell, damage_type: e.target.value})}
                  className="w-full p-3 bg-gray-700 text-white rounded"
                />
                <input
                  type="text"
                  placeholder="Range"
                  value={newSpell.range_distance}
                  onChange={(e) => setNewSpell({...newSpell, range_distance: e.target.value})}
                  className="w-full p-3 bg-gray-700 text-white rounded"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Casting Time"
                  value={newSpell.casting_time}
                  onChange={(e) => setNewSpell({...newSpell, casting_time: e.target.value})}
                  className="w-full p-3 bg-gray-700 text-white rounded"
                />
                <input
                  type="text"
                  placeholder="Duration"
                  value={newSpell.duration}
                  onChange={(e) => setNewSpell({...newSpell, duration: e.target.value})}
                  className="w-full p-3 bg-gray-700 text-white rounded"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">AP Cost</label>
                  <input
                    type="number"
                    value={newSpell.ap_cost}
                    onChange={(e) => setNewSpell({...newSpell, ap_cost: parseInt(e.target.value) || 0})}
                    className="w-full p-3 bg-gray-700 text-white rounded"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">MP Cost</label>
                  <input
                    type="number"
                    value={newSpell.mp_cost}
                    onChange={(e) => setNewSpell({...newSpell, mp_cost: parseInt(e.target.value) || 0})}
                    className="w-full p-3 bg-gray-700 text-white rounded"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">HEX Increment</label>
                  <input
                    type="number"
                    value={newSpell.hex_increment}
                    onChange={(e) => setNewSpell({...newSpell, hex_increment: parseInt(e.target.value) || 0})}
                    className="w-full p-3 bg-gray-700 text-white rounded"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded"
                >
                  Add Spell
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white p-3 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Inventory Tab Component
const InventoryTab = ({ items, character, onUpdate }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    item_type: 'consumable',
    quantity: 1,
    unit_price: 0,
    weight: 0
  });
  const { token } = useAuth();

  const addItem = async (e) => {
    e.preventDefault();
    const response = await api.items.create(character.id, {
      ...newItem,
      total_value: newItem.quantity * newItem.unit_price
    }, token);
    
    if (response.id) {
      setShowAddForm(false);
      setNewItem({
        name: '',
        description: '',
        item_type: 'consumable',
        quantity: 1,
        unit_price: 0,
        weight: 0
      });
      onUpdate();
    }
  };

  const deleteItem = async (itemId) => {
    const response = await api.items.delete(itemId, token);
    if (response.message) {
      onUpdate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Inventory</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Plus size={16} />
          Add Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <div key={item.id} className="bg-gray-800 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-white">{item.name}</h3>
              <button
                onClick={() => deleteItem(item.id)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            {item.description && (
              <p className="text-gray-400 text-sm mb-3">{item.description}</p>
            )}
            
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Type:</span>
                <span className="text-white capitalize">{item.item_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Quantity:</span>
                <span className="text-white">{item.quantity}</span>
              </div>
              {item.unit_price > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Value:</span>
                  <span className="text-yellow-400">{item.total_value || item.unit_price}g</span>
                </div>
              )}
              {item.weight > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Weight:</span>
                  <span className="text-white">{item.weight} lbs</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Add New Item</h3>
            <form onSubmit={addItem} className="space-y-4">
              <input
                type="text"
                placeholder="Item Name"
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                className="w-full p-3 bg-gray-700 text-white rounded"
                required
              />
              
              <select
                value={newItem.item_type}
                onChange={(e) => setNewItem({...newItem, item_type: e.target.value})}
                className="w-full p-3 bg-gray-700 text-white rounded"
              >
                <option value="weapon">Weapon</option>
                <option value="armor">Armor</option>
                <option value="consumable">Consumable</option>
                <option value="tool">Tool</option>
                <option value="treasure">Treasure</option>
                <option value="misc">Miscellaneous</option>
              </select>
              
              <textarea
                placeholder="Description (optional)"
                value={newItem.description}
                onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                className="w-full p-3 bg-gray-700 text-white rounded h-20"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Quantity</label>
                  <input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 1})}
                    className="w-full p-3 bg-gray-700 text-white rounded"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Price (gold)</label>
                  <input
                    type="number"
                    value={newItem.unit_price}
                    onChange={(e) => setNewItem({...newItem, unit_price: parseInt(e.target.value) || 0})}
                    className="w-full p-3 bg-gray-700 text-white rounded"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded"
                >
                  Add Item
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white p-3 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Equipment Tab Component
const EquipmentTab = ({ items, character, toggleEquipment, onUpdate }) => {
  const equippedItems = items.filter(item => item.is_equipped);
  const unequippedItems = items.filter(item => !item.is_equipped);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Equipment</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Equipped Items */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="text-green-400" size={20} />
            Equipped Items
          </h3>
          <div className="space-y-3">
            {equippedItems.length === 0 ? (
              <p className="text-gray-400 italic">No items equipped</p>
            ) : (
              equippedItems.map(item => (
                <div key={item.id} className="bg-green-800 bg-opacity-30 border border-green-600 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-white">{item.name}</h4>
                      <p className="text-green-400 text-sm capitalize">{item.item_type}</p>
                      {item.description && (
                        <p className="text-gray-300 text-sm mt-1">{item.description}</p>
                      )}
                      {item.magical_effects && (
                        <p className="text-blue-400 text-sm mt-1">{item.magical_effects}</p>
                      )}
                    </div>
                    <button
                      onClick={() => toggleEquipment(item)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Unequip
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Available Items */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Package className="text-blue-400" size={20} />
            Available Equipment
          </h3>
          <div className="space-y-3">
            {unequippedItems.filter(item => 
              ['weapon', 'armor', 'accessory', 'tool'].includes(item.item_type)
            ).length === 0 ? (
              <p className="text-gray-400 italic">No equipment available</p>
            ) : (
              unequippedItems
                .filter(item => ['weapon', 'armor', 'accessory', 'tool'].includes(item.item_type))
                .map(item => (
                  <div key={item.id} className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-white">{item.name}</h4>
                        <p className="text-gray-400 text-sm capitalize">{item.item_type}</p>
                        {item.description && (
                          <p className="text-gray-300 text-sm mt-1">{item.description}</p>
                        )}
                        {item.damage_dice && (
                          <p className="text-red-400 text-sm">Damage: {item.damage_dice}</p>
                        )}
                        {item.armor_class_bonus > 0 && (
                          <p className="text-blue-400 text-sm">AC: +{item.armor_class_bonus}</p>
                        )}
                      </div>
                      <button
                        onClick={() => toggleEquipment(item)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Equip
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-900">
        <AppContent 
          selectedCharacter={selectedCharacter}
          setSelectedCharacter={setSelectedCharacter}
        />
      </div>
    </AuthProvider>
  );
};

const AppContent = ({ selectedCharacter, setSelectedCharacter }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  if (selectedCharacter) {
    return (
      <CharacterSheet 
        character={selectedCharacter}
        onBack={() => setSelectedCharacter(null)}
      />
    );
  }

  return (
    <CharacterSelect 
      onCharacterSelect={setSelectedCharacter}
    />
  );
};

export default App;