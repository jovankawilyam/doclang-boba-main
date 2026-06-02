import { CheckCircle2, Upload } from 'lucide-react';
import type { ChangeEvent, HTMLAttributes } from 'react';
import type { FieldPath } from 'react-hook-form';

import {
    errorClassName,
    FILE_ACCEPT_ATTRIBUTE,
    helperClassName,
    inputClassName,
    labelClassName,
} from '../constants';
import type {
    DoclangFormValues,
    FieldHelpers,
    FileInputHelpers,
} from '../types';
import {
    fieldErrorMessage,
    formatUploadedFileSize,
} from '../use-permohonan-form';

export const TextField = ({
    form,
    name,
    label,
    type = 'text',
    placeholder,
    note,
    inputMode,
    pattern,
}: {
    form: FieldHelpers;
    name: FieldPath<DoclangFormValues>;
    label: string;
    type?: string;
    placeholder?: string;
    note?: string;
    inputMode?: HTMLAttributes<HTMLInputElement>['inputMode'];
    pattern?: string;
}) => (
    <div className="space-y-2">
        <label htmlFor={name} className={labelClassName}>
            {label} *
        </label>
        <input
            id={name}
            type={type}
            placeholder={placeholder}
            inputMode={inputMode}
            pattern={pattern}
            className={inputClassName}
            {...form.register(name)}
        />
        {note && <p className={helperClassName}>{note}</p>}
        {form.renderError(name)}
    </div>
);

export const TextAreaField = ({
    form,
    name,
    label,
}: {
    form: FieldHelpers;
    name: FieldPath<DoclangFormValues>;
    label: string;
}) => (
    <div className="space-y-2">
        <label htmlFor={name} className={labelClassName}>
            {label} *
        </label>
        <textarea
            id={name}
            rows={3}
            className={inputClassName}
            {...form.register(name)}
        />
        {form.renderError(name)}
    </div>
);

export const UploadZone = ({
    form,
    name,
    label,
    note,
}: {
    form: FileInputHelpers;
    name: FieldPath<DoclangFormValues>;
    label: string;
    note: string;
}) => {
    const { errors, register, setUploadedFiles, uploadedFiles } = form;
    const message = fieldErrorMessage(errors, name);
    const selectedFile = uploadedFiles[name];
    const fileRegistration = register(name);
    const uploadBoxClassName = selectedFile
        ? 'block cursor-pointer rounded-lg border-2 border-solid border-emerald-300 bg-emerald-50 p-5 text-center transition hover:border-emerald-500 hover:bg-emerald-100'
        : 'block cursor-pointer rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center transition hover:border-blue-500 hover:bg-blue-50';

    const handleFileChange = async (
        event: ChangeEvent<HTMLInputElement>,
    ): Promise<void> => {
        await fileRegistration.onChange(event);

        const file = event.target.files?.item(0);

        setUploadedFiles((currentFiles) => {
            if (!file) {
                const nextFiles = { ...currentFiles };
                delete nextFiles[name];

                return nextFiles;
            }

            return {
                ...currentFiles,
                [name]: {
                    name: file.name,
                    size: file.size,
                },
            };
        });
    };

    return (
        <div className="space-y-2">
            <span className={labelClassName}>{label} *</span>
            <label className={uploadBoxClassName}>
                {selectedFile ? (
                    <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-emerald-700" />
                ) : (
                    <Upload className="mx-auto mb-2 h-6 w-6 text-blue-700" />
                )}
                <span className="block text-sm font-black text-slate-700">
                    {selectedFile ? 'Dokumen berhasil dipilih' : note}
                </span>
                {selectedFile && (
                    <span className="mt-1 block text-xs font-semibold break-words text-emerald-800">
                        {`${selectedFile.name} (${formatUploadedFileSize(selectedFile.size)})`}
                    </span>
                )}
                <input
                    type="file"
                    accept={FILE_ACCEPT_ATTRIBUTE}
                    className="hidden"
                    {...fileRegistration}
                    onChange={handleFileChange}
                />
            </label>
            {selectedFile && (
                <p className="flex items-start gap-2 text-xs leading-5 font-bold text-emerald-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{selectedFile.name} sudah diunggah.</span>
                </p>
            )}
            {message && <p className={errorClassName}>{message}</p>}
        </div>
    );
};
