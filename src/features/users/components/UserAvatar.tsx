import { ComponentProps } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../../components/ui/avatar';

type Props = {
  user: { name: string; imageUrl: string };
} & ComponentProps<typeof Avatar>;

const UserAvatar = ({ user, ...props }: Props) => {
  return (
    <Avatar {...props}>
      <AvatarImage src={user.imageUrl} alt={user.name} />
      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
