import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export function startClassroomTour() {
  const driverObj = driver({
    showProgress: true,
    animate: true,
    overlayColor: 'rgba(15, 23, 42, 0.75)',
    nextBtnText: 'Aage Badho →',
    prevBtnText: '← Peeche',
    doneBtnText: 'Samajh Gaya (Done)!',
    progressText: 'Step {{current}} of {{total}}',
    steps: [
      {
        element: '#tour-live-editor',
        popover: {
          title: '👨‍🏫 Live Teacher Code Stream',
          description:
            'Namaste! Yahan Rahul Sir ka live C code real-time bina kisi delay ke sync hota hai. "Following Camera" se aap sir ke cursor aur line changes ko live follow kar sakte ho.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#tour-split-terminal',
        popover: {
          title: '⚡ Split-Screen Output & Terminal',
          description:
            'Side-by-side terminal me compiled code ka stdout, stderr, aur execution time real-time dikhega. Code run karne ke liye direct **Ctrl + Enter** dabayein!',
          side: 'left',
          align: 'start',
        },
      },
      {
        element: '#tour-doubts-btn',
        popover: {
          title: '❓ Live Doubts Queue',
          description:
            'Class ke dauran pooche gaye sabhi questions is collapsible drawer me dikhte hain. Sir live coding ke sath inline reply aur resolve karte hain.',
          side: 'bottom',
          align: 'center',
        },
      },
      {
        element: '#tour-tasks-btn',
        popover: {
          title: '📋 Class Tasks & Assignments',
          description:
            'Sir dwara diye gaye practical C assignments ko yahan se open karein, code solve karein aur Judge0 compiler se test karke submit karein.',
          side: 'bottom',
          align: 'center',
        },
      },
      {
        element: '#tour-doubts-fab',
        popover: {
          title: '💬 Ask Doubt Floating Button',
          description:
            'Koi bhi doubt aate hi is button par tap karein! Sawaal turant sir ke live dashboard me push ho jayega.',
          side: 'left',
          align: 'end',
        },
      },
    ],
    onDestroyStarted: () => {
      localStorage.setItem('codeclass_tour_completed', 'true');
      driverObj.destroy();
    },
  });

  driverObj.drive();
}
