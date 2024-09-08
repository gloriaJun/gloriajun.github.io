import { AiOutlineHome, AiOutlineSetting } from 'react-icons/ai';

export type MenuItem = {
  text?: string;
  icon: React.ElementType;
};

export const MenuItemList: Array<MenuItem> = [
  {
    text: 'Home',
    icon: AiOutlineHome,
  },
  {
    text: 'Settings',
    icon: AiOutlineSetting,
  },
];
