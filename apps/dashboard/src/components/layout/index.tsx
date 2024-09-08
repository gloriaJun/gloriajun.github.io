'use client';
import { BiMenu } from 'react-icons/bi';

import {
  Box,
  Flex,
  Heading,
  HStack,
  IconButton,
  List,
  Text,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';

import { MenuItemList } from '@/components/layout/menus';

import { ListElement } from './ListElement';

export default function Layout({
  brandName,
  children,
}: {
  brandName: string;
  children: React.ReactNode;
}) {
  const { getButtonProps, isOpen } = useDisclosure();
  const buttonProps = getButtonProps();

  return (
    <>
      <Flex
        as="nav"
        alignItems="center"
        justifyContent="space-between"
        h="16"
        py="2.5"
        pr="2.5"
      >
        <HStack spacing={2}>
          <IconButton
            {...buttonProps}
            _active={{}}
            _focus={{}}
            _hover={{}}
            fontSize="18px"
            variant="ghost"
            icon={<BiMenu />}
            aria-label="open menu"
          />
          <Heading as="h1" size="md">
            {brandName}
          </Heading>
        </HStack>
      </Flex>
      <HStack align="start" spacing={0}>
        <Box
          as="aside"
          minH="90vh"
          w={isOpen ? 72 : 12}
          borderRight="2px"
          borderColor={useColorModeValue('gray.200', 'gray.900')}
          transition="width 0.25s ease"
        >
          <List spacing={0} p="0.5">
            {MenuItemList.map((item, index) => (
              <ListElement
                key={index}
                icon={item.icon}
                text={isOpen ? item.text : ''}
              />
            ))}
          </List>
        </Box>
        <Flex
          as="main"
          w="full"
          minH="90vh"
          align="center"
          justify="center"
          bg={useColorModeValue('gray.50', 'gray.900')}
        >
          <Box textAlign="center">{children}</Box>
        </Flex>
      </HStack>
    </>
  );
}
