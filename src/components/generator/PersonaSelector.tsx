import { useEffect } from 'react';
import { Checkbox, Tag, Space, Typography } from 'antd';
import { usePersonaStore } from '../../stores/personaStore';
import { useGeneratorStore } from '../../stores/generatorStore';
import type { Persona } from '../../types';

const { Text } = Typography;

const PERSONA_COLORS: Record<string, string> = {
  Comedian: 'magenta',
  Expert: 'blue',
  Host: 'green',
  Moderator: 'orange',
  Villain: 'red',
};

export default function PersonaSelector() {
  const { personas, fetchPersonas } = usePersonaStore();
  const { selectedPersonas, setSelectedPersonas } = useGeneratorStore();

  useEffect(() => {
    fetchPersonas();
  }, [fetchPersonas]);

  const handleChange = (checkedIds: string[]) => {
    const selected = personas.filter((p) => checkedIds.includes(p.id));
    setSelectedPersonas(selected);
  };

  return (
    <div>
      <Text strong style={{ marginBottom: 8, display: 'block' }}>Chọn Persona:</Text>
      <Checkbox.Group
        value={selectedPersonas.map((p) => p.id)}
        onChange={(values) => handleChange(values as string[])}
      >
        <Space wrap>
          {personas.map((persona: Persona) => (
            <Checkbox key={persona.id} value={persona.id}>
              <Tag color={PERSONA_COLORS[persona.name] || 'purple'}>
                {persona.name}
                {persona.is_default ? '' : ' ✨'}
              </Tag>
            </Checkbox>
          ))}
        </Space>
      </Checkbox.Group>
    </div>
  );
}
