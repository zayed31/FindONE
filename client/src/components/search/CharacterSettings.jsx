import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Zap, Moon, Sun } from 'lucide-react';
import { useSearch } from '../../context/SearchContext';

const CharacterSettings = ({ isOpen, onClose }) => {
  const { characterSettings, updateCharacterSettings } = useSearch();
  const [localSettings, setLocalSettings] = useState(characterSettings);

  const handleSave = () => {
    updateCharacterSettings(localSettings);
    onClose();
  };

  const handleReset = () => {
    setLocalSettings(characterSettings);
  };

  const frequencyOptions = [
    { value: 'low', label: 'Low', icon: Moon, description: 'Appears rarely' },
    { value: 'normal', label: 'Normal', icon: Sun, description: 'Balanced frequency' },
    { value: 'high', label: 'High', icon: Zap, description: 'Appears often' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-800/95 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Character Settings</h3>
                  <p className="text-gray-400 text-sm">Customize RED's behavior</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Settings */}
            <div className="space-y-6">
              {/* Enable/Disable */}
              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.enabled}
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      enabled: e.target.checked
                    })}
                    className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                  />
                  <span className="text-white font-medium">Enable Animated Character</span>
                </label>
                <p className="text-gray-400 text-sm mt-1 ml-7">
                  Show RED character around the search bar
                </p>
              </div>

              {/* Frequency */}
              <div>
                <label className="text-white font-medium mb-3 block">Appearance Frequency</label>
                <div className="space-y-2">
                  {frequencyOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <label
                        key={option.value}
                        className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          localSettings.frequency === option.value
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <input
                          type="radio"
                          name="frequency"
                          value={option.value}
                          checked={localSettings.frequency === option.value}
                          onChange={(e) => setLocalSettings({
                            ...localSettings,
                            frequency: e.target.value
                          })}
                          className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600 focus:ring-purple-500 focus:ring-2"
                        />
                        <Icon className="w-5 h-5 text-gray-400" />
                        <div>
                          <span className="text-white font-medium">{option.label}</span>
                          <p className="text-gray-400 text-sm">{option.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Reactions */}
              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.reactions}
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      reactions: e.target.checked
                    })}
                    className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                  />
                  <span className="text-white font-medium">Enable Reactions</span>
                </label>
                <p className="text-gray-400 text-sm mt-1 ml-7">
                  Character reacts to search focus and actions
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 mt-8">
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-teal-500 text-white rounded-lg hover:from-purple-600 hover:to-teal-600 transition-all transform hover:scale-105"
              >
                Save Settings
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CharacterSettings; 