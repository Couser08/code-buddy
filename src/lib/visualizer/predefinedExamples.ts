// Predefined Interactive Examples for C Visual Memory Lab
// Tailored with real-life analogies, clean starter code, concept-first overviews,
// and 'Why Use It Professionally in C?' industry insights.

export interface VisualizerTopic {
  id: string;
  title: string;
  category: string;
  badge: string;
  conceptName: string;
  whyUseProfessionally: string;
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
    badge: 'Memory Sizing',
    conceptName: 'Hardware Memory Allocation & Fixed Data Sizing',
    whyUseProfessionally:
      'C me explicit data types (int, float, char) isliye use kiye jaate hain kyunki microprocessors me registers fixed bit-widths (8-bit, 32-bit, 64-bit) par kaam karte hain. Accurate data type choose karne se RAM bachti hai aur CPU cache line alignment optimize hoti hai.',
    analogyTitle: 'Fit-to-Size Labeled Containers (Dabba System)',
    analogyDescription:
      'Variable ek labeled dabba hai jiska size pehle se fix hai. Jaise 1kg ghee ke dabbe me 5kg atta nahi thons sakte, waise hi 1-Byte char me 4-Byte integer save nahi ho sakta.',
    analogyIcon: 'Box',
    code: `#include <stdio.h>

int main() {
    int age = 21;            // 4 Bytes stack memory
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
    badge: 'Zero-Copy Ref',
    conceptName: 'Direct Memory Addressing & Pointer Dereferencing',
    whyUseProfessionally:
      'Professional C me functions me heavy data copy karne ke bajaye memory address pass kiya jaata hai (Zero-Copy Architecture). Ye embedded hardware registers ko control karne, Dynamic Heap Memory (malloc) handle karne, aur O(1) pass-by-reference ke liye mandatory hai.',
    analogyTitle: 'Bank Locker Key / GPS Location Slip',
    analogyDescription:
      'Pointer koi saman nahi hai, balki saman ka "Locker Number" ya "GPS Address" hai. Jab aap *ptr = 250 likhte ho, to aap locker ke andar jakar direct saman badal rahe ho!',
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
    id: 'stack-lifo',
    title: 'Stack Memory (Call Stack)',
    category: 'Memory Architecture',
    badge: 'LIFO Protocol',
    conceptName: 'Call Stack Frame & LIFO (Last-In-First-Out) Allocation',
    whyUseProfessionally:
      'Microprocessor CPU Stack Pointer (RSP/ESP) ko shift karke O(1) ultrafast speed par local variables allocate aur free karta hai. Isme garbage collection ki zaroorat nahi padti aur memory fragmentation zero hoti hai.',
    analogyTitle: 'Wedding Buffet Plates Stack',
    analogyDescription:
      'Buffet me plates ek ke upar ek rakhi jaati hain. Jo plate sabse aakhri me rakhi gayi (Push), wo sabse pehle uthai jaati hai (Pop). Stack hamesha LIFO rule par chalta hai.',
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
    conceptName: 'Sequential Queue Buffer & FIFO Task Scheduling',
    whyUseProfessionally:
      'Operating System process schedulers, networking packet buffers (TCP router queues), aur keyboard keystroke drivers FIFO queues use karte hain taaki aane wale requests fair order me execute ho sakein bina data drop hue.',
    analogyTitle: 'Metro Ticket Counter / Bus Stop Line',
    analogyDescription:
      'Ticket line me jo insaan sabse pehle aakar khada hota hai (Enqueue), ticket counter usko pehle serve karke bahar nikalta hai (Dequeue). FIFO = First In, First Out!',
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
  {
    id: 'arrays-contiguous',
    title: '1D Arrays & Memory Layout',
    category: 'Data Structures',
    badge: 'Contiguous',
    conceptName: 'Contiguous Memory Slices & CPU Cache Line Locality',
    whyUseProfessionally:
      'Array ke elements RAM me ek ke baad ek (contiguous) store hote hain. Is wajah se CPU L1/L2 cache prefetcher poore block ko ek saath load kar leta hai, jo linked lists ke comparison me 10x fast iteration speed deta hai.',
    analogyTitle: 'Train Ke Attached Coaches',
    analogyDescription:
      'Array ek train ki tarah hai jisme sabhi coaches [0], [1], [2] ek doosre se continuous jude hote hain. Har coach ka fix index hota hai aur address me exact 4-Byte ka jump hota hai.',
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
    badge: 'Packed Records',
    conceptName: 'Composite Records & Binary Memory Packing',
    whyUseProfessionally:
      'Network protocols (TCP/IP headers), device drivers, aur game engines me different types (int, char, float) ko ek single continuous memory record me pack karne ke liye struct standard industry format hai.',
    analogyTitle: 'Student Identity Card (Packed Record)',
    analogyDescription:
      'Ek plastic student ID card me Roll No (int), Name (chars), aur Marks (float) ek saath bind hote hain. Card ek hai, lekin uske andar alag-alag information fields organized hain.',
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
    id: 'for-while-loops',
    title: 'Loops (For & While)',
    category: 'Iterations',
    badge: 'Iteration Tracker',
    conceptName: 'Deterministic Iteration & Loop Invariants',
    whyUseProfessionally:
      'Batch data processing, matrix multiplication, aur servers ke main event loops (jaise Nginx ya Node.js event loop) deterministic iteration patterns par run karte hain bina redundant code likhe.',
    analogyTitle: 'Athletics Track Ke Rounds',
    analogyDescription:
      'Jab coach bolta hai 4 round lagaao, to runner har round ke baad lap counter badhata hai (i++). Jaise hi 4 rounds poore ho jaate hain, runner ruk jaata hai!',
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
    id: 'if-else-branching',
    title: 'If-Else Decision Making',
    category: 'Control Flow',
    badge: 'Branch Prediction',
    conceptName: 'Conditional Branching & CPU Jump Instructions',
    whyUseProfessionally:
      'Microprocessor hardware condition flags (Zero Flag ZF, Carry Flag CF) check karke instruction flow alter karta hai. Industry me input validation, access control, aur error-handling guard clauses branching par depend karte hain.',
    analogyTitle: 'Railway Track Switcher',
    analogyDescription:
      'Signal agar GREEN hai to train main track par chali jaati hai (if block). Signal RED hai to track switch hokar train loop line par chali jaati hai (else block).',
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
    badge: 'O(1) Jump Table',
    conceptName: 'Jump Table (Branch Dispatch Table) Optimization',
    whyUseProfessionally:
      'Jab multiple discrete states ya enum handling ho, compiler switch-case ko sequential if-ladder ke bajaye assembly me O(1) Jump Table me compile karta hai, jisse instruction dispatch instant ho jaata hai.',
    analogyTitle: 'TV Remote Ka Direct Number Pad',
    analogyDescription:
      'TV remote par channel 2 dabane par TV direct channel 2 kholta hai. Wo 1, 2, 3 ko sequentially check nahi karta, seedha targeted case address par jump karta hai!',
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
];
