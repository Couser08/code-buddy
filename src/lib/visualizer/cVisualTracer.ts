// C Visual Execution Tracer Engine
// Parses C code constructs (variables, pointers, arrays, structs, if-else, switch, loops)
// and produces step-by-step memory frames with Hinglish explanations and real-life analogies.

import { VISUALIZER_TOPICS, VisualizerTopic } from './predefinedExamples';

export interface VariableState {
  name: string;
  type: string;
  value: any;
  address: string;
  byteSize: number;
  highlight?: boolean;
}

export interface PointerLink {
  fromVar: string;
  fromAddress: string;
  toVar: string;
  toAddress: string;
  targetValue: any;
}

export interface ArrayState {
  name: string;
  type: string;
  baseAddress: string;
  elementSize: number;
  elements: {
    index: number;
    value: any;
    address: string;
    highlight?: boolean;
  }[];
}

export interface StructMember {
  name: string;
  type: string;
  value: any;
  offset: number;
}

export interface StructState {
  name: string;
  structType: string;
  baseAddress: string;
  totalSize: number;
  members: StructMember[];
}

export interface StackItem {
  id: string;
  name: string;
  value: any;
  address: string;
  isTop: boolean;
}

export interface QueueItem {
  index: number;
  value: any;
  status: 'front' | 'enqueued' | 'dequeued';
}

export interface ExecutionStep {
  stepIndex: number;
  lineNumber: number;
  codeLine: string;
  actionDescription: string;
  conceptName?: string;
  whyUseProfessionally?: string;
  variables: VariableState[];
  pointers: PointerLink[];
  arrays: ArrayState[];
  structures: StructState[];
  stackItems?: StackItem[];
  queueItems?: QueueItem[];
  branchState?: {
    condition: string;
    evaluatedTo: boolean;
    takenBranch: string;
  };
  switchState?: {
    expression: string;
    evaluatedValue: any;
    matchedCase: string;
  };
  loopState?: {
    loopType: 'for' | 'while' | 'do-while';
    variableName: string;
    currentValue: any;
    iteration: number;
    conditionText: string;
    conditionMet: boolean;
  };
  callStack: string[];
  stdout: string;
  hinglishExplanation: string;
  analogyTitle?: string;
  analogyText?: string;
  analogyIcon?: string;
}

const HEX_BASE = 0x7ffd00;

export function detectTopicFromCode(code: string, topicId?: string): VisualizerTopic {
  if (topicId) {
    const found = VISUALIZER_TOPICS.find((t) => t.id === topicId);
    if (found) return found;
  }
  const lower = code.toLowerCase();
  if (lower.includes('plate') || lower.includes('lifo') || lower.includes('stack')) {
    return VISUALIZER_TOPICS.find((t) => t.id === 'stack-lifo') || VISUALIZER_TOPICS[2];
  }
  if (lower.includes('queue') || lower.includes('fifo') || lower.includes('enqueue') || lower.includes('dequeue')) {
    return VISUALIZER_TOPICS.find((t) => t.id === 'queue-fifo') || VISUALIZER_TOPICS[3];
  }
  if (code.includes('*') && (code.includes('&') || code.includes('*ptr') || code.includes('*p'))) {
    return VISUALIZER_TOPICS.find((t) => t.id === 'pointers-basics') || VISUALIZER_TOPICS[1];
  }
  if (code.includes('struct ')) {
    return VISUALIZER_TOPICS.find((t) => t.id === 'structures-struct') || VISUALIZER_TOPICS[5];
  }
  if (code.includes('arr[') || code.includes('][') || /\w+\[\d+\]/.test(code)) {
    return VISUALIZER_TOPICS.find((t) => t.id === 'arrays-contiguous') || VISUALIZER_TOPICS[4];
  }
  if (code.includes('for (') || code.includes('while (')) {
    return VISUALIZER_TOPICS.find((t) => t.id === 'for-while-loops') || VISUALIZER_TOPICS[6];
  }
  if (code.includes('switch (')) {
    return VISUALIZER_TOPICS.find((t) => t.id === 'switch-case') || VISUALIZER_TOPICS[8];
  }
  if (code.includes('if (')) {
    return VISUALIZER_TOPICS.find((t) => t.id === 'if-else-branching') || VISUALIZER_TOPICS[7];
  }
  return VISUALIZER_TOPICS[0];
}

export function traceCCode(code: string, topicId?: string): ExecutionStep[] {
  const activeTopic = detectTopicFromCode(code, topicId);
  const isStackTopic = activeTopic.id === 'stack-lifo';
  const isQueueTopic = activeTopic.id === 'queue-fifo';

  const lines = code.split('\n');
  const steps: ExecutionStep[] = [];

  let stdoutAccumulator = '';
  let addressCounter = HEX_BASE;

  const getNextAddress = (bytes: number): string => {
    const addr = '0x' + addressCounter.toString(16);
    addressCounter += bytes;
    return addr;
  };

  const variables: Map<string, VariableState> = new Map();
  const pointers: PointerLink[] = [];
  const arrays: Map<string, ArrayState> = new Map();
  const structures: Map<string, StructState> = new Map();

  let inMain = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();
    const lineNum = i + 1;

    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) {
      continue;
    }

    if (trimmed.includes('main(')) {
      inMain = true;
      const initialCallStack = isStackTopic
        ? ['Stack Frame: main() [RSP Initialized @ 0x7ffd00]']
        : isQueueTopic
        ? ['Queue Buffer: Initialized [Front=0, Rear=0]']
        : [`main() Stack Frame @ 0x7ffd00`];

      steps.push({
        stepIndex: steps.length + 1,
        lineNumber: lineNum,
        codeLine: rawLine,
        actionDescription: `${activeTopic.conceptName} - System Setup`,
        conceptName: activeTopic.conceptName,
        whyUseProfessionally: activeTopic.whyUseProfessionally,
        variables: Array.from(variables.values()),
        pointers: [...pointers],
        arrays: Array.from(arrays.values()),
        structures: Array.from(structures.values()),
        stackItems: [],
        queueItems: [],
        callStack: initialCallStack,
        stdout: stdoutAccumulator,
        hinglishExplanation: `${activeTopic.title} architecture initialize ho raha hai. ${activeTopic.analogyDescription}`,
        analogyTitle: activeTopic.analogyTitle,
        analogyText: activeTopic.analogyDescription,
        analogyIcon: activeTopic.analogyIcon,
      });
      continue;
    }

    if (!inMain) continue;
    if (trimmed === '}') continue;

    // 1. Array declaration: int arr[5] = {10, 20, 30}; or int arr[3];
    const arrayDeclMatch = trimmed.match(/^(int|float|char|double)\s+([a-zA-Z_]\w*)\[(\d+)\](?:\s*=\s*\{([^}]+)\})?;/);
    if (arrayDeclMatch) {
      const [, type, arrName, sizeStr, initValuesStr] = arrayDeclMatch;
      const size = parseInt(sizeStr, 10);
      const elemSize = type === 'char' ? 1 : type === 'double' ? 8 : 4;
      const baseAddr = getNextAddress(size * elemSize);

      const initVals = initValuesStr
        ? initValuesStr.split(',').map((v) => {
            const num = parseFloat(v.trim());
            return isNaN(num) ? v.trim() : num;
          })
        : new Array(size).fill(0);

      const elements = [];
      let currentElemAddr = parseInt(baseAddr, 16);
      for (let j = 0; j < size; j++) {
        elements.push({
          index: j,
          value: initVals[j] !== undefined ? initVals[j] : 0,
          address: '0x' + currentElemAddr.toString(16),
          highlight: true,
        });
        currentElemAddr += elemSize;
      }

      arrays.set(arrName, {
        name: arrName,
        type,
        baseAddress: baseAddr,
        elementSize: elemSize,
        elements,
      });

      const queueElements: QueueItem[] = isQueueTopic
        ? elements.map((el) => ({
            index: el.index,
            value: el.value,
            status: el.index === 0 ? 'front' : 'enqueued',
          }))
        : [];

      steps.push({
        stepIndex: steps.length + 1,
        lineNumber: lineNum,
        codeLine: rawLine,
        actionDescription: isQueueTopic
          ? `FIFO Queue Buffer initialized with ${size} arrivals (Front: ${elements[0]?.value}, Rear: ${elements[size - 1]?.value})`
          : `Allocated contiguous array ${arrName}[${size}] of type ${type}`,
        conceptName: activeTopic.conceptName,
        whyUseProfessionally: activeTopic.whyUseProfessionally,
        variables: Array.from(variables.values()),
        pointers: [...pointers],
        arrays: Array.from(arrays.values()),
        structures: Array.from(structures.values()),
        queueItems: isQueueTopic ? queueElements : undefined,
        callStack: isQueueTopic ? [`Queue Buffer [Capacity: ${size} | Active: ${size}]`] : ['main()'],
        stdout: stdoutAccumulator,
        hinglishExplanation: isQueueTopic
          ? `Queue buffer me ${size} items FIFO order me arrive huye. Sabse pehla item '${elements[0]?.value}' Front pointer par hai aur serve hone ke liye ready hai!`
          : `Memory me '${arrName}' ke liye lagataar (contiguous) ${size * elemSize} bytes reserve ho gaye hain. Har agla element pichle wale se ${elemSize} bytes aage hai.`,
        analogyTitle: activeTopic.analogyTitle,
        analogyText: activeTopic.analogyDescription,
        analogyIcon: activeTopic.analogyIcon,
      });
      continue;
    }

    // 2. Struct declaration or variable: struct Student s1 = {1, "Rahul", 95.5};
    const structVarMatch = trimmed.match(/^struct\s+([a-zA-Z_]\w*)\s+([a-zA-Z_]\w*)(?:\s*=\s*\{([^}]+)\})?;/);
    if (structVarMatch) {
      const [, structType, varName, initValsStr] = structVarMatch;
      const baseAddr = getNextAddress(28);

      const vals = initValsStr ? initValsStr.split(',').map((s) => s.trim().replace(/['"]/g, '')) : ['101', 'Rahul', '88.5'];
      const members: StructMember[] = [
        { name: 'roll_no', type: 'int', value: vals[0] || '101', offset: 0 },
        { name: 'name', type: 'char[20]', value: vals[1] || 'Rahul', offset: 4 },
        { name: 'marks', type: 'float', value: vals[2] || '92.5', offset: 24 },
      ];

      structures.set(varName, {
        name: varName,
        structType,
        baseAddress: baseAddr,
        totalSize: 28,
        members,
      });

      steps.push({
        stepIndex: steps.length + 1,
        lineNumber: lineNum,
        codeLine: rawLine,
        actionDescription: `Created structure variable '${varName}' of type struct ${structType}`,
        conceptName: activeTopic.conceptName,
        whyUseProfessionally: activeTopic.whyUseProfessionally,
        variables: Array.from(variables.values()),
        pointers: [...pointers],
        arrays: Array.from(arrays.values()),
        structures: Array.from(structures.values()),
        callStack: ['main()'],
        stdout: stdoutAccumulator,
        hinglishExplanation: `'struct ${structType}' ne alag-alag data types (int, string, float) ko ek single packet '${varName}' me pack kar diya hai. Memory address ${baseAddr} par poora record store hai.`,
        analogyTitle: activeTopic.analogyTitle,
        analogyText: activeTopic.analogyDescription,
        analogyIcon: activeTopic.analogyIcon,
      });
      continue;
    }

    // 3. Pointer declaration: int *ptr = &a; or int *p;
    const pointerDeclMatch = trimmed.match(/^(int|float|char|double)\s*\*\s*([a-zA-Z_]\w*)(?:\s*=\s*&([a-zA-Z_]\w*))?;/);
    if (pointerDeclMatch) {
      const [, type, ptrName, targetVarName] = pointerDeclMatch;
      const ptrAddr = getNextAddress(8); // 64-bit pointer = 8 bytes

      let targetAddr = '0x0';
      let targetVal: any = null;

      if (targetVarName && variables.has(targetVarName)) {
        const target = variables.get(targetVarName)!;
        targetAddr = target.address;
        targetVal = target.value;
      }

      variables.set(ptrName, {
        name: ptrName,
        type: `${type}*`,
        value: targetAddr,
        address: ptrAddr,
        byteSize: 8,
        highlight: true,
      });

      if (targetVarName) {
        pointers.push({
          fromVar: ptrName,
          fromAddress: ptrAddr,
          toVar: targetVarName,
          toAddress: targetAddr,
          targetValue: targetVal,
        });
      }

      steps.push({
        stepIndex: steps.length + 1,
        lineNumber: lineNum,
        codeLine: rawLine,
        actionDescription: targetVarName
          ? `Pointer '${ptrName}' holds memory address of '${targetVarName}' (&${targetVarName} = ${targetAddr})`
          : `Declared pointer variable '${ptrName}' (uninitialized / NULL)`,
        conceptName: activeTopic.conceptName,
        whyUseProfessionally: activeTopic.whyUseProfessionally,
        variables: Array.from(variables.values()),
        pointers: [...pointers],
        arrays: Array.from(arrays.values()),
        structures: Array.from(structures.values()),
        callStack: ['main()'],
        stdout: stdoutAccumulator,
        hinglishExplanation: targetVarName
          ? `Pointer '${ptrName}' ne '${targetVarName}' ka physical memory address (${targetAddr}) store kar liya. Ab '${ptrName}' seedha '${targetVarName}' ke RAM cell ko point kar raha hai!`
          : `Pointer '${ptrName}' ban chuka hai. Yeh kisi normal number ko nahi, balki memory address ko hold karega.`,
        analogyTitle: activeTopic.analogyTitle,
        analogyText: activeTopic.analogyDescription,
        analogyIcon: activeTopic.analogyIcon,
      });
      continue;
    }

    // 4. Pointer dereference assignment: *ptr = 50;
    const derefMatch = trimmed.match(/^\*([a-zA-Z_]\w*)\s*=\s*([^;]+);/);
    if (derefMatch) {
      const [, ptrName, newValStr] = derefMatch;
      const newVal = evalMathSimple(newValStr, variables);
      const link = pointers.find((p) => p.fromVar === ptrName);

      if (link && variables.has(link.toVar)) {
        const targetVar = variables.get(link.toVar)!;
        targetVar.value = newVal;
        targetVar.highlight = true;
        link.targetValue = newVal;

        steps.push({
          stepIndex: steps.length + 1,
          lineNumber: lineNum,
          codeLine: rawLine,
          actionDescription: `Dereferenced *${ptrName} = ${newVal}: Directly updated memory of '${link.toVar}' at ${link.toAddress}`,
          conceptName: activeTopic.conceptName,
          whyUseProfessionally: activeTopic.whyUseProfessionally,
          variables: Array.from(variables.values()),
          pointers: [...pointers],
          arrays: Array.from(arrays.values()),
          structures: Array.from(structures.values()),
          callStack: ['main()'],
          stdout: stdoutAccumulator,
          hinglishExplanation: `*${ptrName} ka use karke CPU ne '${ptrName}' ke pointer address (${link.toAddress}) par direct jump kiya aur '${link.toVar}' ki value ko ${newVal} se overwrite kar diya. Original variable ko direct touch kiye bina memory mutate ho gayi!`,
          analogyTitle: activeTopic.analogyTitle,
          analogyText: activeTopic.analogyDescription,
          analogyIcon: activeTopic.analogyIcon,
        });
      }
      continue;
    }

    // 5. Standard variable declaration: int a = 10; float f = 3.14; char ch = 'A';
    const varDeclMatch = trimmed.match(/^(int|float|char|double)\s+([a-zA-Z_]\w*)(?:\s*=\s*([^;]+))?;/);
    if (varDeclMatch) {
      const [, type, varName, initValStr] = varDeclMatch;
      const byteSize = type === 'char' ? 1 : type === 'double' ? 8 : 4;
      const addr = getNextAddress(byteSize);
      let val: any = 0;

      if (initValStr) {
        if (initValStr.includes('queue[0]') && arrays.has('queue')) {
          const qArr = arrays.get('queue')!;
          val = qArr.elements[0]?.value ?? 101;
        } else {
          val = evalMathSimple(initValStr, variables);
        }
      }

      variables.set(varName, {
        name: varName,
        type,
        value: val,
        address: addr,
        byteSize,
        highlight: true,
      });

      const isStackItem = isStackTopic && varName.toLowerCase().includes('plate');
      const isQueueDequeue = isQueueTopic && Boolean(initValStr && initValStr.includes('queue[0]'));

      const currentStackItems: StackItem[] = isStackTopic
        ? Array.from(variables.values()).map((v, idx, arr) => ({
            id: v.name,
            name: v.name,
            value: v.value,
            address: v.address,
            isTop: idx === arr.length - 1,
          }))
        : [];

      const currentQueueItems: QueueItem[] = isQueueTopic
        ? (arrays.get('queue')?.elements || []).map((el) => ({
            index: el.index,
            value: el.value,
            status: isQueueDequeue && el.index === 0 ? 'dequeued' : el.index === (isQueueDequeue ? 1 : 0) ? 'front' : 'enqueued',
          }))
        : [];

      let actionDesc = `Allocated ${type} variable '${varName}' = ${val} (${byteSize}B at ${addr})`;
      let hinglish = `RAM me '${varName}' ke liye ${byteSize} bytes reserve huye. Address '${addr}' par value '${val}' write ho gayi.`;

      if (isStackItem) {
        actionDesc = `PUSH: Added '${varName}' (${val}) onto Stack Frame (Depth: ${variables.size}, Top of Stack = ${varName})`;
        hinglish = `'${varName}' (${val}) ko stack frame ke top par PUSH kiya gaya. Hardware Stack Pointer (RSP) shift ho gaya aur ye variable ab active Top of Stack hai.`;
      } else if (isQueueDequeue) {
        actionDesc = `FIFO DEQUEUE: Served Front ticket ID (${val}) to '${varName}'`;
        hinglish = `FIFO rule execute hua: Queue ke front par khada pehla element (${val}) serve ho chuka hai aur dequeue ho gaya!`;
      }

      steps.push({
        stepIndex: steps.length + 1,
        lineNumber: lineNum,
        codeLine: rawLine,
        actionDescription: actionDesc,
        conceptName: activeTopic.conceptName,
        whyUseProfessionally: activeTopic.whyUseProfessionally,
        variables: Array.from(variables.values()),
        pointers: [...pointers],
        arrays: Array.from(arrays.values()),
        structures: Array.from(structures.values()),
        stackItems: isStackTopic ? currentStackItems : undefined,
        queueItems: isQueueTopic ? currentQueueItems : undefined,
        callStack: isStackTopic
          ? [`Stack Frame [Depth: ${variables.size} | Top of Stack: ${varName}]`]
          : isQueueDequeue
          ? [`Queue Buffer [Served: 1 | Remaining: 2]`]
          : ['main()'],
        stdout: stdoutAccumulator,
        hinglishExplanation: hinglish,
        analogyTitle: activeTopic.analogyTitle,
        analogyText: activeTopic.analogyDescription,
        analogyIcon: activeTopic.analogyIcon,
      });
      continue;
    }

    // 6. Variable update: a = a + 5; or a = 20;
    const varAssignMatch = trimmed.match(/^([a-zA-Z_]\w*)\s*=\s*([^;]+);/);
    if (varAssignMatch) {
      const [, varName, exprStr] = varAssignMatch;
      if (variables.has(varName)) {
        const targetVar = variables.get(varName)!;
        const oldVal = targetVar.value;
        const newVal = evalMathSimple(exprStr, variables);
        targetVar.value = newVal;
        targetVar.highlight = true;

        steps.push({
          stepIndex: steps.length + 1,
          lineNumber: lineNum,
          codeLine: rawLine,
          actionDescription: `Updated variable '${varName}': ${oldVal} ➔ ${newVal}`,
          conceptName: activeTopic.conceptName,
          whyUseProfessionally: activeTopic.whyUseProfessionally,
          variables: Array.from(variables.values()),
          pointers: [...pointers],
          arrays: Array.from(arrays.values()),
          structures: Array.from(structures.values()),
          callStack: ['main()'],
          stdout: stdoutAccumulator,
          hinglishExplanation: `'${varName}' ke purane data (${oldVal}) ko overwrite karke naya data (${newVal}) daal diya gaya. Memory address (${targetVar.address}) wahi raha.`,
          analogyTitle: activeTopic.analogyTitle,
          analogyText: activeTopic.analogyDescription,
          analogyIcon: activeTopic.analogyIcon,
        });
        continue;
      }
    }

    // 7. If-Else condition: if (a > 10)
    const ifMatch = trimmed.match(/^if\s*\(([^)]+)\)/);
    if (ifMatch) {
      const condition = ifMatch[1];
      const evaluated = evalCondition(condition, variables);

      steps.push({
        stepIndex: steps.length + 1,
        lineNumber: lineNum,
        codeLine: rawLine,
        actionDescription: `Evaluating condition (${condition}) ➔ ${evaluated ? 'TRUE' : 'FALSE'}`,
        conceptName: activeTopic.conceptName,
        whyUseProfessionally: activeTopic.whyUseProfessionally,
        variables: Array.from(variables.values()),
        pointers: [...pointers],
        arrays: Array.from(arrays.values()),
        structures: Array.from(structures.values()),
        branchState: {
          condition,
          evaluatedTo: evaluated,
          takenBranch: evaluated ? 'if block executed' : 'if block skipped',
        },
        callStack: ['main()'],
        stdout: stdoutAccumulator,
        hinglishExplanation: evaluated
          ? `Condition (${condition}) TRUE nikli! Program CPU jump flag set karke 'if' block execute karega.`
          : `Condition (${condition}) FALSE ho gayi! 'if' block skip hoga aur program 'else' ya agle statement par badhega.`,
        analogyTitle: activeTopic.analogyTitle,
        analogyText: activeTopic.analogyDescription,
        analogyIcon: activeTopic.analogyIcon,
      });
      continue;
    }

    // 8. Switch statement: switch (choice)
    const switchMatch = trimmed.match(/^switch\s*\(([^)]+)\)/);
    if (switchMatch) {
      const expr = switchMatch[1];
      const val = variables.has(expr) ? variables.get(expr)!.value : expr;

      steps.push({
        stepIndex: steps.length + 1,
        lineNumber: lineNum,
        codeLine: rawLine,
        actionDescription: `Evaluating switch expression '${expr}' (value = ${val})`,
        conceptName: activeTopic.conceptName,
        whyUseProfessionally: activeTopic.whyUseProfessionally,
        variables: Array.from(variables.values()),
        pointers: [...pointers],
        arrays: Array.from(arrays.values()),
        structures: Array.from(structures.values()),
        switchState: {
          expression: expr,
          evaluatedValue: val,
          matchedCase: `case ${val}`,
        },
        callStack: ['main()'],
        stdout: stdoutAccumulator,
        hinglishExplanation: `Switch statement '${expr}' ki value (${val}) ko evaluate kar raha hai. Compiler O(1) Jump Table lookup se seedha matching case par switch karega.`,
        analogyTitle: activeTopic.analogyTitle,
        analogyText: activeTopic.analogyDescription,
        analogyIcon: activeTopic.analogyIcon,
      });
      continue;
    }

    // 9. Case statement: case 1: or case 'A':
    const caseMatch = trimmed.match(/^case\s+([^:]+):/);
    if (caseMatch) {
      const caseVal = caseMatch[1];
      steps.push({
        stepIndex: steps.length + 1,
        lineNumber: lineNum,
        codeLine: rawLine,
        actionDescription: `Execution reached 'case ${caseVal}:'`,
        conceptName: activeTopic.conceptName,
        whyUseProfessionally: activeTopic.whyUseProfessionally,
        variables: Array.from(variables.values()),
        pointers: [...pointers],
        arrays: Array.from(arrays.values()),
        structures: Array.from(structures.values()),
        callStack: ['main()'],
        stdout: stdoutAccumulator,
        hinglishExplanation: `Target case ${caseVal} match ho gaya. Ab is case ke instructions run honge jab tak 'break' nahi milta.`,
        analogyTitle: activeTopic.analogyTitle,
        analogyText: activeTopic.analogyDescription,
        analogyIcon: activeTopic.analogyIcon,
      });
      continue;
    }

    // 10. For Loop: for (int i = 0; i < 3; i++)
    const forMatch = trimmed.match(/^for\s*\(\s*(?:int\s+)?([a-zA-Z_]\w*)\s*=\s*(\d+)\s*;\s*([^;]+)\s*;\s*([^)]+)\)/);
    if (forMatch) {
      const [, varName, startValStr, condStr] = forMatch;
      const startVal = parseInt(startValStr, 10);
      const varAddr = variables.has(varName) ? variables.get(varName)!.address : getNextAddress(4);

      // Simulate 3-4 loop iterations for clean visual demonstration
      for (let iter = 0; iter <= 3; iter++) {
        const currentVal = startVal + iter;
        const conditionMet = iter < 3;

        variables.set(varName, {
          name: varName,
          type: 'int',
          value: currentVal,
          address: varAddr,
          byteSize: 4,
          highlight: true,
        });

        steps.push({
          stepIndex: steps.length + 1,
          lineNumber: lineNum,
          codeLine: rawLine,
          actionDescription: `Loop iteration #${iter + 1}: ${varName} = ${currentVal}, check condition (${condStr}) ➔ ${conditionMet ? 'CONTINUE' : 'TERMINATED'}`,
          conceptName: activeTopic.conceptName,
          whyUseProfessionally: activeTopic.whyUseProfessionally,
          variables: Array.from(variables.values()),
          pointers: [...pointers],
          arrays: Array.from(arrays.values()),
          structures: Array.from(structures.values()),
          loopState: {
            loopType: 'for',
            variableName: varName,
            currentValue: currentVal,
            iteration: iter + 1,
            conditionText: condStr,
            conditionMet,
          },
          callStack: ['main()'],
          stdout: stdoutAccumulator,
          hinglishExplanation: conditionMet
            ? `Iteration #${iter + 1}: '${varName}' = ${currentVal}. Condition '${condStr}' TRUE hai, loop body execute hogi.`
            : `Loop complete! '${varName}' = ${currentVal} hone par boundary condition FALSE ho gayi aur loop terminate hua.`,
          analogyTitle: activeTopic.analogyTitle,
          analogyText: activeTopic.analogyDescription,
          analogyIcon: activeTopic.analogyIcon,
        });

        if (!conditionMet) break;
      }
      continue;
    }

    // 11. Printf statement: printf("Hello %d\n", a);
    if (trimmed.includes('printf(')) {
      let outputText = '';
      const stringLiteralMatch = trimmed.match(/printf\s*\(\s*"([^"]*)"/);
      if (stringLiteralMatch) {
        outputText = stringLiteralMatch[1].replace(/\\n/g, '\n');
        // Substitute basic format specifiers
        const argMatch = trimmed.match(/printf\s*\([^,]+,\s*([^)]+)\)/);
        if (argMatch) {
          const argName = argMatch[1].trim();
          if (variables.has(argName)) {
            outputText = outputText.replace(/%[dfsc]/, variables.get(argName)!.value);
          }
        }
      }
      stdoutAccumulator += outputText;

      let actionDesc = `Standard Output printed: "${outputText.trim()}"`;
      let hinglish = `printf() ne terminal stream par text print kar diya. OS stdout buffer flushed.`;

      if (isStackTopic && rawLine.includes('plate3')) {
        actionDesc = `LIFO PEEK / ACCESS: Top of Stack is plate3 = ${variables.get('plate3')?.value || 30}`;
        hinglish = `LIFO Rule Verified: Jo plate sabse aakhri me push hui thi (plate3 = 30), wahi sabse pehle access hui (Last In, First Out).`;
      } else if (isQueueTopic && rawLine.includes('firstStudent')) {
        actionDesc = `FIFO SERVICE VERIFIED: First student ID ${variables.get('firstStudent')?.value || 101} served`;
        hinglish = `FIFO Rule Verified: Jo student sabse pehle line me aaya tha, wahi sabse pehle process hua (First In, First Out).`;
      }

      steps.push({
        stepIndex: steps.length + 1,
        lineNumber: lineNum,
        codeLine: rawLine,
        actionDescription: actionDesc,
        conceptName: activeTopic.conceptName,
        whyUseProfessionally: activeTopic.whyUseProfessionally,
        variables: Array.from(variables.values()),
        pointers: [...pointers],
        arrays: Array.from(arrays.values()),
        structures: Array.from(structures.values()),
        stackItems: isStackTopic
          ? Array.from(variables.values()).map((v, idx, arr) => ({
              id: v.name,
              name: v.name,
              value: v.value,
              address: v.address,
              isTop: idx === arr.length - 1,
            }))
          : undefined,
        queueItems: isQueueTopic
          ? (arrays.get('queue')?.elements || []).map((el) => ({
              index: el.index,
              value: el.value,
              status: el.index === 0 ? 'dequeued' : el.index === 1 ? 'front' : 'enqueued',
            }))
          : undefined,
        callStack: isStackTopic
          ? [`Stack Frame [Depth: ${variables.size} | Top of Stack: plate3]`]
          : isQueueTopic
          ? [`Queue Buffer [Served: 1 | Remaining: 2]`]
          : ['main()'],
        stdout: stdoutAccumulator,
        hinglishExplanation: hinglish,
        analogyTitle: activeTopic.analogyTitle,
        analogyText: activeTopic.analogyDescription,
        analogyIcon: activeTopic.analogyIcon,
      });
      continue;
    }

    // 12. Return statement: return 0;
    if (trimmed.startsWith('return')) {
      steps.push({
        stepIndex: steps.length + 1,
        lineNumber: lineNum,
        codeLine: rawLine,
        actionDescription: 'return 0: main() finished successfully, deallocating stack frame from memory',
        conceptName: activeTopic.conceptName,
        whyUseProfessionally: activeTopic.whyUseProfessionally,
        variables: Array.from(variables.values()),
        pointers: [...pointers],
        arrays: Array.from(arrays.values()),
        structures: Array.from(structures.values()),
        callStack: [],
        stdout: stdoutAccumulator,
        hinglishExplanation: 'return 0 ke sath execution complete ho gaya. Operating System ne stack frame aur local variables ko memory se clean (pop) kar diya.',
        analogyTitle: 'Success Stamp / Thumbs Up',
        analogyText: 'Jaise exam paper submit karte waqt supervisor "All Done" stamp lagata hai, return 0 operating system ko batata hai ki sab badiya raha!',
        analogyIcon: 'CheckCheck',
      });
      break;
    }
  }

  return steps.length > 0 ? steps : createFallbackSteps();
}

function evalMathSimple(expr: string, vars: Map<string, VariableState>): any {
  expr = expr.trim();
  if (expr.startsWith('"') || expr.startsWith("'")) {
    return expr.replace(/['"]/g, '');
  }

  for (const [name, variable] of vars.entries()) {
    const regex = new RegExp(`\\b${name}\\b`, 'g');
    expr = expr.replace(regex, variable.value);
  }

  try {
    if (/^[0-9+\-*/().\s]+$/.test(expr)) {
      // eslint-disable-next-line no-eval
      return Number(Function(`"use strict"; return (${expr})`)());
    }
  } catch (e) {}

  return isNaN(Number(expr)) ? expr : Number(expr);
}

function evalCondition(cond: string, vars: Map<string, VariableState>): boolean {
  for (const [name, variable] of vars.entries()) {
    const regex = new RegExp(`\\b${name}\\b`, 'g');
    cond = cond.replace(regex, variable.value);
  }

  try {
    cond = cond.replace(/&&/g, '&&').replace(/\|\|/g, '||');
    if (/^[0-9><=!&|().\s]+$/.test(cond)) {
      // eslint-disable-next-line no-eval
      return Boolean(Function(`"use strict"; return (${cond})`)());
    }
  } catch (e) {}

  return true;
}

function createFallbackSteps(): ExecutionStep[] {
  return [
    {
      stepIndex: 1,
      lineNumber: 1,
      codeLine: 'int a = 10;',
      actionDescription: 'Allocated int variable a = 10',
      variables: [{ name: 'a', type: 'int', value: 10, address: '0x7ffd00', byteSize: 4 }],
      pointers: [],
      arrays: [],
      structures: [],
      callStack: ['main()'],
      stdout: '',
      hinglishExplanation: 'Variable "a" memory me create hua aur value 10 assign ho gayi.',
      analogyTitle: 'Labeled Dabba',
      analogyText: 'Ek dabba jisme 10 store kiya gaya hai.',
      analogyIcon: 'Box',
    },
  ];
}
