import { ContractDeployment, popTestnet } from 'typink';
import psp22Metadata from './artifacts/psp22/psp22.json';

export enum ContractId {
  PSP22 = 'psp22'
}

export const deployments: ContractDeployment[] = [
  {
    id: ContractId.PSP22,
    metadata: psp22Metadata as any,
    network: popTestnet.id,
    address: '13JSR8RUSxtg11MLg2Pj5jV7Yh9sh9gCnjFW7ReHGmDj5Rvq',
  },
];

