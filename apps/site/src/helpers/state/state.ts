import { CreateSignalOptions, effect, signal, WritableSignal } from "@angular/core";

export type StoredSignalOptions<T> = CreateSignalOptions<T> & {
    serialize?: (state: T) => string,
    unserialize?: (stringifiedState: string) => T 
};

/**
 * Cria um Signal que sincroniza o valor automaticamente com
 * o localStorage. 
 * 
 * @usage As mesmas regras de criação de Signal também valem para
 * esta função.
 */
export default function storedSignal<T>(
    storageKey: string, 
    initialValue: T,
    options: StoredSignalOptions<T> = {}
): WritableSignal<T> {
    const serializeFn = options.serialize ?? JSON.stringify;
    const unserializeFn = options.unserialize ?? JSON.parse;

    const storagedSignalValue = localStorage.getItem(storageKey);
    const signalValue = storagedSignalValue !== null 
        ? unserializeFn(storagedSignalValue) as T
        : initialValue;

    const state = signal(signalValue, options);
    
    effect(() => {
        localStorage.setItem(storageKey, serializeFn(state()));
    });

    return state;
}

