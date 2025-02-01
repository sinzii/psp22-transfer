import { Box, Button, Flex, FormControl, FormHelperText, FormLabel, Heading, Input, Text } from '@chakra-ui/react';
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import PendingText from '@/components/shared/PendingText.tsx';
import { useApp } from '@/providers/AppProvider.tsx';
import { shortenAddress } from '@/utils/string.ts';
import { txToaster } from '@/utils/txToaster.tsx';
import { useContractQuery, useContractTx, useWatchContractEvent } from 'typink';

export default function GreetBoard() {
  const { greeterContract: contract } = useApp();
  const [message, setMessage] = useState('');
  const setMessageTx = useContractTx(contract, 'setMessage');

  const { data: greet, isLoading } = useContractQuery({
    contract,
    fn: 'greet',
    watch: true,
  });

  const handleUpdateGreeting = async (e: any) => {
    e?.preventDefault();

    if (!contract || !message) return;

    const toaster = txToaster();

    try {
      await setMessageTx.signAndSend({
        args: [message],
        callback: (result) => {
          const { status } = result;
          console.log(status);

          if (status.type === 'BestChainBlockIncluded') {
            setMessage('');
          }

          toaster.onTxProgress(result);
        },
      });
    } catch (e: any) {
      toaster.onTxError(e);
    }
  };

  // Listen to Greeted event from system events
  // & update the greeting message in real-time
  //
  // To verify this, try open 2 tabs of the app
  // & update the greeting message in one tab,
  // you will see the greeting message updated in the other tab
  useWatchContractEvent(
    contract,
    'Greeted',
    useCallback((events) => {
      events.forEach((greetedEvent) => {
        const {
          name,
          data: { from, message },
        } = greetedEvent;

        console.log(`Found a ${name} event sent from: ${from?.address()}, message: ${message}  `);

        toast.info(
          <div>
            <p>
              Found a <b>{name}</b> event
            </p>
            <p style={{ fontSize: 12 }}>
              Sent from: <b>{shortenAddress(from?.address())}</b>
            </p>
            <p style={{ fontSize: 12 }}>
              Greeting message: <b>{message}</b>
            </p>
          </div>,
        );
      });
    }, []),
  );

  return (
    <Box>
      <Heading size='md' mb={2}>
        Sample Greeter Contract
      </Heading>
      <Text>Send a greeting message to the world!</Text>
      <Flex my={4} gap={2}>
        <Text>Message:</Text>
        <PendingText fontWeight='600' isLoading={isLoading} color='primary.500'>
          {greet}
        </PendingText>
      </Flex>
      <form onSubmit={handleUpdateGreeting}>
        <FormControl>
          <FormLabel>Update message:</FormLabel>
          <Input
            type='input'
            maxLength={50}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            isDisabled={setMessageTx.inBestBlockProgress}
          />
          <FormHelperText>Max 50 characters</FormHelperText>
        </FormControl>
        <Button type='submit' size='sm' mt={4} isDisabled={!message} isLoading={setMessageTx.inBestBlockProgress}>
          Update Greeting
        </Button>
      </form>
    </Box>
  );
}
