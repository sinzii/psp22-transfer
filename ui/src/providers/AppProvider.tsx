import { createContext, useContext } from 'react';
import { Props } from '@/types.ts';
import { ContractId } from 'contracts/deployments.ts';
import { Psp22ContractApi } from 'contracts/types/psp22';
import { Contract } from 'dedot/contracts';
import { useContract } from 'typink';

interface AppContextProps {
  psp22Contract?: Contract<Psp22ContractApi>;
}

const AppContext = createContext<AppContextProps>({} as any);

export const useApp = () => {
  return useContext(AppContext);
};

export function AppProvider({ children }: Props) {
  const { contract: psp22Contract } = useContract<Psp22ContractApi>(ContractId.PSP22);

  return (
    <AppContext.Provider
      value={{
        psp22Contract,
      }}>
      {children}
    </AppContext.Provider>
  );
}
