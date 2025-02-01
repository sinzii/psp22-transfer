import {
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightAddon,
  Text,
} from '@chakra-ui/react';
import { useState } from 'react';
import PendingText from '@/components/shared/PendingText.tsx';
import { useApp } from '@/providers/AppProvider.tsx';
import { txToaster } from '@/utils/txToaster.tsx';
import { decodeAddress } from 'dedot/utils';
import { formatBalance, useContractQuery, useContractTx, useTypink } from 'typink';

interface PSP22TransferProps {
  connectedAddress: string;
}

function PSP22Transfer({ connectedAddress }: PSP22TransferProps) {
  const { psp22Contract: contract } = useApp();
  const tokenSymbol = useContractQuery({ contract, fn: 'psp22MetadataTokenSymbol' });
  const decimals = useContractQuery({ contract, fn: 'psp22MetadataTokenDecimals' });
  const balance = useContractQuery({
    contract,
    fn: 'psp22BalanceOf',
    args: [connectedAddress],
    watch: true,
  });

  const isLoading = tokenSymbol.isLoading && decimals.isLoading && balance.isLoading;

  const [destAddress, setDestAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const transferTx = useContractTx(contract, 'psp22Transfer');

  const enableTransfer = !!destAddress && !!amount && !!decimals.data;

  const doTransfer = async (e: any) => {
    e && e.preventDefault();

    if (!enableTransfer) return;

    const toaster = txToaster();

    try {
      if (destAddress == connectedAddress) {
        throw new Error('Cannot transfer to the same address');
      }

      decodeAddress(destAddress); // validate address
      const amountToTransfer = BigInt(+amount) * BigInt(Math.pow(10, decimals.data!));

      await transferTx.signAndSend({
        args: [destAddress, amountToTransfer, '0x'],
        callback: (progress) => {
          toaster.onTxProgress(progress);
        },
      });
    } catch (e: any) {
      console.error(e);
      toaster.onTxError(e);
    }
  };

  return (
    <>
      <Text>Balance:</Text>
      <PendingText fontWeight='600' isLoading={isLoading} color='primary.500'>
        {formatBalance(balance.data, { symbol: tokenSymbol.data, decimals: decimals.data })}
      </PendingText>
      <Divider my={8} />
      <form onSubmit={doTransfer}>
        <Heading size='sm' mb={2}>
          Transfer PSP22 to a different account
        </Heading>
        <FormControl mb={2}>
          <FormLabel>Destination Address</FormLabel>
          <Input placeholder='Address' type='text' onChange={(e) => setDestAddress(e.target.value)} />
        </FormControl>

        <FormControl mb={4}>
          <FormLabel>Amount</FormLabel>
          <InputGroup>
            <Input placeholder='Amount' type='number' onChange={(e) => setAmount(e.target.value)} />
            {tokenSymbol.data && <InputRightAddon>{tokenSymbol.data}</InputRightAddon>}
          </InputGroup>
        </FormControl>

        <Button
          colorScheme='primary'
          type='submit'
          isDisabled={!enableTransfer}
          isLoading={transferTx.inBestBlockProgress}>
          Transfer
        </Button>
      </form>
    </>
  );
}

export default function MainBoard() {
  const { connectedAccount } = useTypink();

  return (
    <Box>
      <Heading size='md' mb={2}>
        PSP22 Transfer
      </Heading>
      <Box my={4} gap={2}>
        {connectedAccount ? (
          <PSP22Transfer connectedAddress={connectedAccount.address} />
        ) : (
          <Text>Connect to your wallet to getting started!</Text>
        )}
      </Box>
    </Box>
  );
}
