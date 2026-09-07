// Predefined Interactive Examples for C Visual Memory Lab
// Tailored with real-life analogies, clean starter code, and Hinglish concept overviews.

export interface VisualizerTopic {
  id: string;
  title: string;
  category: string;
  badge: string;
  analogyTitle: string;
  analogyDescription: string;
  analogyIcon: string;
  code: string;
  summary: string;
}

export const VISUALIZER_TOPICS: VisualizerTopic[] = [
  {
    id: 'variables-data-types',
    title: 'Variables & Data Types',
    category: 'Foundations',
    badge: 'Memory Size',
    analogyTitle: 'Labeled Dabba (Container)',
    analogyDescription: 'Variable ek labeled dabba hai jisme aap sirf ek specific type ka saman rakh sakte ho. Jaise chawal ke dabbe me dal nahi daal sakte, waise hi int ke dabbe me float ya char nahi!',
    analogyIcon: 'Box',
    code: `#include <stdio.h>

int main() {
    int age = 21;            // 4 Bytes memory
    float marks = 89.5;      // 4 Bytes floating point
    char grade = 'A';        // 1 Byte ASCII character
    double salary = 45000.75; // 8 Bytes high precision

    printf("Student Grade: %c, Age: %d\\n", grade, age);
    return 0;
}`,
    summary: 'See how RAM allocates specific byte sizes for int (4B), char (1B), float (4B), and double (8B) at distinct hex addresses.',
  },
  {
    id: 'pointers-basics',
    title: 'Pointers & Address-Of (&, *)',
    category: 'Pointers & Memory',
    badge: 'GPS Address',
    analogyTitle: 'Ghar Ka Address (GPS Parchi)',
    analogyDescription: 'Pointer ek aisi parchi (slip) hai jispe kisi doosre ghar ka address likha hota hai, na ki saman. Jab aap *ptr bolte ho, to aap parchi ke address wale ghar ke andar rakha saman badal rahe ho!',
    analogyIcon: 'Navigation',
    code: `#include <stdio.h>

int main() {
    int score = 100;
    int *ptr = &score; // ptr holds memory address of score

    printf("Original score: %d\\n", score);

    // Modify score indirectly via pointer dereference
    *ptr = 250;

    printf("Modified score via pointer: %d\\n", score);
    return 0;
}`,
    summary: 'Watch SVG pointer arrows dynamically point to target variable memory cells and see dereferencing in action.',
  },
  {
    id: 'if-else-branching',
    title: 'If-Else Decision Making',
    category: 'Control Flow',
    badge: 'Road Fork',
    analogyTitle: 'Traffic Signal & Road Fork',
    analogyDescription: 'Signal Green hai to aage badho (if block), Red hai to gaadi mod kar dusre raste (else block) par chalo!',
    analogyIcon: 'GitFork',
    code: `#include <stdio.h>

int main() {
    int marks = 78;

    if (marks >= 90) {
        printf("Grade: A+ (Outstanding)\\n");
    } else if (marks >= 75) {
        printf("Grade: Distinction (Good Job)\\n");
    } else {
        printf("Grade: Pass (Keep improving)\\n");
    }

    return 0;
}`,
    summary: 'Visualize conditional branch evaluation: see which branch executes and which blocks are skipped in real time.',
  },
  {
    id: 'switch-case',
    title: 'Switch-Case Statement',
    category: 'Control Flow',
    badge: 'Direct Jump',
    analogyTitle: 'TV Remote Ka Channel Button',
    analogyDescription: 'TV remote par button 3 dabaya to direct Channel 3 khulta hai! Switch-case me compiler line-by-line check nahi karta, seedha matching case par jump karta hai.',
    analogyIcon: 'LayoutList',
    code: `#include <stdio.h>

int main() {
    int choice = 2;

    switch (choice) {
        case 1:
            printf("Selected Option 1: View Profile\\n");
            break;
        case 2:
            printf("Selected Option 2: Start C Compiler\\n");
            break;
        case 3:
            printf("Selected Option 3: Check Doubts Queue\\n");
            break;
        default:
            printf("Invalid Option\\n");
            break;
    }

    return 0;
}`,
    summary: 'Observe how switch expressions bypass sequential if-ladders and jump straight to the matching case label.',
  },
  {
    id: 'for-while-loops',
    title: 'Loops (For & While)',
    category: 'Iterations',
    badge: 'Round Tracker',
    analogyTitle: 'Chhat (Terrace) Ke Chakkar',
    analogyDescription: 'Jab tak chakkar count target (5) tak nahi pahunchta, tab tak daudte raho! Har round ke baad count badhao aur condition check karo.',
    analogyIcon: 'RotateCw',
    code: `#include <stdio.h>

int main() {
    int total = 0;

    for (int i = 1; i <= 4; i++) {
        total = total + i;
        printf("Step %d: total = %d\\n", i, total);
    }

    printf("Final Sum = %d\\n", total);
    return 0;
}`,
    summary: 'Watch loop variable i increment, condition evaluate to TRUE, execute body, and terminate when boundary is reached.',
  },
  {
    id: 'arrays-contiguous',
    title: '1D Arrays & Memory Layout',
    category: 'Data Structures',
    badge: 'Contiguous',
    analogyTitle: 'Train Ke Connected Dibbe',
    analogyDescription: 'Array ek train ki tarah hai jiske sare dibbe ek ke peeche ek contiguous line me jude hote hain. Train ka naam ek hai, aur har dibbe ka fix seat index [0], [1], [2] hota hai.',
    analogyIcon: 'Grid',
    code: `#include <stdio.h>

int main() {
    int arr[4] = {10, 20, 30, 40};

    printf("Element 0: %d\\n", arr[0]);
    printf("Element 2: %d\\n", arr[2]);

    arr[1] = 99; // Update second element

    return 0;
}`,
    summary: 'Inspect sequential memory blocks with +4 byte address increments (0x7ff0, 0x7ff4, 0x7ff8) and index lookups.',
  },
  {
    id: 'structures-struct',
    title: 'Structures (struct)',
    category: 'Custom Types',
    badge: 'Packed Form',
    analogyTitle: 'Student Biodata / ID Card',
    analogyDescription: 'Ek hi plastic ID card me student ka Roll No (int), Naam (char array), aur Marks (float) ek compact packet me pack hota hai.',
    analogyIcon: 'CreditCard',
    code: `#include <stdio.h>

struct Student {
    int roll_no;
    char name[20];
    float marks;
};

int main() {
    struct Student s1 = {101, "Rahul", 92.5};

    printf("Roll: %d, Marks: %.1f\\n", s1.roll_no, s1.marks);
    return 0;
}`,
    summary: 'Understand how struct packs heterogeneous types into a single contiguous composite memory record.',
  },
  {
    id: 'stack-lifo',
    title: 'Stack Memory (Call Stack)',
    category: 'Memory Architecture',
    badge: 'LIFO Protocol',
    analogyTitle: 'Shadi Ki Party Ki Plates',
    analogyDescription: 'Party me plates ek ke upar ek rakhi hoti hain. Jo plate sabse aakhri me rakhi jaati hai (Push), wo sabse pehle uthai jaati hai (Pop): Last In, First Out (LIFO)!',
    analogyIcon: 'Layers',
    code: `#include <stdio.h>

int main() {
    int plate1 = 10; // Pushed onto stack
    int plate2 = 20; // Pushed on top of plate1
    int plate3 = 30; // Top of stack (LIFO)

    printf("Top plate: %d\\n", plate3);
    return 0;
}`,
    summary: 'Visualize stack frame allocation and why local variables are automatically popped when a function terminates.',
  },
  {
    id: 'queue-fifo',
    title: 'Queue Buffer Concept',
    category: 'Memory Architecture',
    badge: 'FIFO Protocol',
    analogyTitle: 'Bus Stop / Ticket Counter Line',
    analogyDescription: 'Ticket counter par jo insaan pehle line me khada hota hai (Enqueue), usko ticket pehle milti hai aur wo pehle bahar nikalta hai (Dequeue): First In, First Out (FIFO)!',
    analogyIcon: 'Users',
    code: `#include <stdio.h>

int main() {
    int queue[3] = {101, 102, 103}; // Arrived in order

    int firstStudent = queue[0];     // Served first (FIFO)
    printf("Served ticket to student ID: %d\\n", firstStudent);

    return 0;
}`,
    summary: 'Contrast LIFO stack behavior with FIFO queue scheduling for real-time systems and operating system schedulers.',
  },
];
