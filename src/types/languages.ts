export interface LanguageConfig {
  id: string;
  name: string;
  judge0Id: number;
  monacoLang: string;
  fileExtension: string;
  defaultBoilerplate: string;
  isDefault?: boolean;
}

export const SUPPORTED_LANGUAGES: Record<string, LanguageConfig> = {
  c: {
    id: 'c',
    name: 'C (GCC 9.2.0)',
    judge0Id: 50,
    monacoLang: 'c',
    fileExtension: 'c',
    defaultBoilerplate: `#include <stdio.h>

int main() {
    printf("Hello, C Classroom!\\n");
    return 0;
}
`,
    isDefault: true,
  },
  cpp: {
    id: 'cpp',
    name: 'C++ (GCC 9.2.0)',
    judge0Id: 54,
    monacoLang: 'cpp',
    fileExtension: 'cpp',
    defaultBoilerplate: `#include <iostream>

int main() {
    std::cout << "Hello from C++!\\n";
    return 0;
}
`,
    isDefault: false,
  },
  python: {
    id: 'python',
    name: 'Python (3.8.1)',
    judge0Id: 71,
    monacoLang: 'python',
    fileExtension: 'py',
    defaultBoilerplate: `print("Hello from Python!")
`,
    isDefault: false,
  },
};

export const DEFAULT_LANGUAGE = SUPPORTED_LANGUAGES['c'];
