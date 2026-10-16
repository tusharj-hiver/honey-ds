import { User01 } from '@honey-ds/icons';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { AVATAR_COLORS, Avatar } from './avatar';

const SIZES = ['3xs', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;
const NAMES = ['Darlene Robertson', 'Bessie Cooper', 'Albert Flores', 'Esther Howard'];

// A 1×1 inline PNG, so the Picture story needs no network.
const PHOTO =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkqPtfDwAEgwG/mKqVvQAAAABJRU5ErkJggg==';

const meta = {
  title: 'Primitives/Avatar',
  component: Avatar,
  args: { name: 'Darlene Robertson' },
  parameters: {
    design: { figmaNode: '4770:1200' },
    ai: {
      summary:
        'Honey DS avatar: photo, initials or icon; 9 sizes, circle or rounded, solid or subtle; colour derived from the name.',
      useWhen:
        'Representing a person (customer, agent) or an inbox next to their name or in a list row.',
      avoidWhen: 'Brand or app logos (use the image directly) or status indicators (use Badge).',
    },
  },
} satisfies Meta<typeof Avatar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const avatar = canvas.getByRole('img', { name: 'Darlene Robertson' });
    await expect(avatar).toHaveTextContent('DR');
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {(['solid', 'subtle'] as const).map((bg) => (
        <div key={bg} className="flex items-center gap-2">
          {AVATAR_COLORS.map((c) => (
            <Avatar key={c} name={`${c} ${bg}`} color={c} background={bg} />
          ))}
          <Avatar name="Unknown person" icon={<User01 />} background={bg} />
          <Avatar name="Rounded avatar" shape="rounded" background={bg} />
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      {SIZES.map((s) => (
        <Avatar key={s} name="Bessie Cooper" size={s} />
      ))}
    </div>
  ),
};

export const ColourFromName: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      {NAMES.map((n) => (
        <Avatar key={n} name={n} />
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    // Same name, same colour, every render.
    const a = canvas.getByRole('img', { name: 'Bessie Cooper' });
    await expect(a.className).toMatch(/bg-accents-\w+-intense/);
  },
};

export const Picture: Story = {
  args: { src: PHOTO },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('img', { name: 'Darlene Robertson' })).toBeInTheDocument();
  },
};

export const BrokenPicture: Story = {
  args: { src: 'data:image/png;base64,broken' },
  play: async ({ canvas }) => {
    // Falls back to initials when the image fails.
    await expect(canvas.getByRole('img', { name: 'Darlene Robertson' })).toHaveTextContent('DR');
  },
};
