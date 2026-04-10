import React from 'react';
import type { CampoDinamico } from '../../../types/formulario';
import { Input } from '../../common/ui/Input';
import { Textarea } from '../../common/ui/Textarea';
import { Select } from '../../common/ui/Select';
import { RadioGroup } from '../RadioGroup';
import { CheckboxGroup } from '../CheckboxGroup';
import { FileInput } from '../../common/ui/FileInput';

type FieldRendererProps = CampoDinamico & {
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
};

export const FieldRenderer: React.FC<FieldRendererProps> = ({
  id,
  label,
  tipo,
  obrigatorio,
  placeholder,
  opcoes = [],
  value,
  onChange,
  error,
}) => {
  const radioOptions = opcoes.map((opt) => ({ value: opt.id, label: opt.valor }));

  switch (tipo) {
    case 'TEXTO':
    case 'EMAIL':
    case 'TELEFONE':
    case 'NUMERO': {
      const inputType =
        tipo === 'EMAIL' ? 'email' :
        tipo === 'NUMERO' ? 'number' :
        tipo === 'TELEFONE' ? 'tel' :
        'text';
      return (
        <Input
          label={label}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          type={inputType}
          error={error}
          fullWidth
        />
      );
    }

    case 'DATA':
      return (
        <Input
          label={label}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          type="date"
          max={(() => {
            const d = new Date();
            return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
          })()}
          error={error}
          fullWidth
        />
      );

    case 'AREA':
      return (
        <Textarea
          label={label}
          value={(value as string) ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          required={obrigatorio}
          error={error}
        />
      );

    case 'SELECT':
      return (
        <Select
          label={label}
          value={(value as string) ?? ''}
          onChange={onChange}
          options={opcoes}
          placeholder={placeholder}
          required={obrigatorio}
          error={error}
        />
      );

    case 'MULTISELECT':
      return (
        <Select
          label={label}
          value={(value as string[]) ?? []}
          onChange={onChange}
          options={opcoes}
          multiple
          required={obrigatorio}
          error={error}
        />
      );

    case 'RADIO':
      return (
        <RadioGroup
          name={id}
          label={label}
          options={radioOptions}
          value={(value as string) ?? ''}
          onChange={(v) => onChange(v)}
          required={obrigatorio}
          error={error}
        />
      );

    case 'BOOLEAN':
      return (
        <RadioGroup
          name={id}
          label={label}
          options={[
            { value: 'true', label: 'Sim' },
            { value: 'false', label: 'Não' },
          ]}
          value={(value as string) ?? ''}
          onChange={(v) => onChange(v)}
          required={obrigatorio}
          error={error}
        />
      );

    case 'CHECKBOX':
      return (
        <CheckboxGroup
          label={label}
          options={opcoes}
          value={(value as string[]) ?? []}
          onChange={onChange}
          required={obrigatorio}
          error={error}
        />
      );

    case 'ARQUIVO':
      return (
        <FileInput
          label={label}
          onChange={onChange}
          required={obrigatorio}
          error={error}
        />
      );

    default:
      return null;
  }
};
