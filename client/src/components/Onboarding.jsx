import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Onboarding = () => {
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [hoveredPersona, setHoveredPersona] = useState(null);
  const navigate = useNavigate();

  const personas = [
    {
      id: 'professor',
      title: 'Professor',
      description: 'Manage courses and academic research content'
    },
    {
      id: 'hod',
      title: 'HOD',
      description: 'Oversee department faculty and resources'
    },
    {
      id: 'researcher',
      title: 'Researcher',
      description: 'Organize research papers and collaborative data'
    },
    {
      id: 'admin',
      title: 'Faculty Admin',
      description: 'Manage institutional academic records'
    }
  ];

  const handlePersonaSelect = (personaId) => {
    setSelectedPersona(personaId);
    // Navigate to signup with selected persona
    navigate('/signup');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="animate-fade-in-down">
            <h1 className="text-6xl font-bold mb-8 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 drop-shadow-lg">
              CODEC
            </h1>
          </div>
          <div className="animate-fade-in-up animation-delay-200">
            <p className="text-lg text-gray-400">
              Welcome to the exclusive faculty repository. Choose your role to get started.
            </p>
          </div>
        </div>

        <div className="animate-fade-in animation-delay-400">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {personas.map((persona) => (
              <div
                key={persona.id}
                onClick={() => handlePersonaSelect(persona.id)}
                onMouseEnter={() => setHoveredPersona(persona.id)}
                onMouseLeave={() => setHoveredPersona(null)}
                className={`
                  relative p-6 rounded-xl border cursor-pointer transition-all duration-300 ease-out
                  backdrop-blur-md transform
                  ${hoveredPersona && hoveredPersona !== persona.id
                    ? 'blur-sm opacity-50 scale-95'
                    : 'scale-100'
                  }
                  ${selectedPersona === persona.id
                    ? 'border-indigo-400 bg-white/15 shadow-lg shadow-indigo-400/20'
                    : hoveredPersona === persona.id
                      ? 'border-white/30 bg-white/10 shadow-xl shadow-white/10 scale-105 brightness-110'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }
                `}
              >
                {selectedPersona === persona.id && (
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 bg-indigo-400 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}

                <div className="flex flex-col items-center text-center">
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {persona.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {persona.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedPersona && (
          <div className="mt-8 text-center">
            <button className="px-8 py-3 bg-indigo-400 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors duration-200">
              Continue as {personas.find(p => p.id === selectedPersona)?.title}
            </button>
          </div>
        )}

        {/* Navigation Links */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 font-medium hover:from-gray-400 hover:to-gray-600 transition-all"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
