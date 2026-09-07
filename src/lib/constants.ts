export const ADMIN_EMAIL = 'tungariyarahul08@gmail.com';

export const JUDGE0_DEFAULT_URL = 'https://judge0-ce.p.rapidapi.com';

export interface NavItem {
  name: string;
  href: string;
  icon: string;
  badge?: number | string;
}

export const NAV_ITEMS: NavItem[] = [
  { name: 'Home', href: '/', icon: 'Home' },
  { name: 'Live Class', href: '/live', icon: 'Video' },
  { name: 'Visual Memory Lab', href: '/visualizer', icon: 'BrainCircuit', badge: 'Visual' },
  { name: 'C Playground', href: '/playground', icon: 'Code2', badge: 'IDE' },
  { name: 'Tasks', href: '/tasks', icon: 'FileCode2' },
  { name: 'Submissions', href: '/submissions', icon: 'CheckSquare' },
  { name: 'Doubts', href: '/doubts', icon: 'HelpCircle', badge: 3 },
  { name: 'Students', href: '/students', icon: 'Users' },
  { name: 'Resources', href: '/resources', icon: 'FolderGit2' },
  { name: 'Design System', href: '/design-system', icon: 'Sparkles', badge: 'Demos' },
];

export const INITIAL_C_CODE = `#include <stdio.h>

int main() {
    printf("Hello, C!\\n");
    return 0;
}`;
