// C Visual Execution Tracer Engine
// Parses C code constructs (variables, pointers, arrays, structs, if-else, switch, loops)
// and produces step-by-step memory frames with Hinglish explanations and real-life analogies.

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

export interface ExecutionStep {
  stepIndex: number;
  lineNumber: number;
  codeLine: string;
  actionDescription: string;
  variables: VariableState[];
  pointers: PointerLink[];
  arrays: ArrayState[];
  structures: StructState[];
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

export function traceCCode(code: string): ExecutionStep[] {
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
      steps.push({
        stepIndex: steps.length + 1,
        lineNumber: lineNum,
        codeLine: rawLine,
        actionDescription: 'Program execution starts in main()',
        variables: Array.from(variables.values()),
        pointers: [...pointers],
        arrays: Array.from(arrays.values()),
        structures: Array.from(structures.values()),
        callStack: ['main()'],
        stdout: stdoutAccumulator,
        hinglishExplanation: 'C program ka execution hamesha main() function se start hota hai. Operating System ne stack frame create kar diya hai.',
        analogyTitle: 'Ghar Ka Main Gate',
        analogyText: 'Jaise kisi school ya function me sabhi log Main Gate (main function) se enter karte hain, waise hi C compiler execute hona main() se hi start karta hai.',
        analogyIcon: 'DoorOpen',
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

      steps.push({
        stepIndex: steps.length + 1,
        lineNumber: lineNum,
        codeLine: rawLine,
        actionDescription: `Allocated contiguous array ${arrName}[${size}] of type ${type}`,
        variables: Array.from(variables.values()),
        pointers: [...pointers],
        arrays: Array.from(arrays.values()),
        structures: Array.from(structures.values()),
        callStack: ['main()'],
        stdout: stdoutAccumulator,
        hinglishExplanation: `Memory me '${arrName}' ke liye lagataar (contiguous) ${size * elemSize} bytes reserve ho gaye hain. Har agla element pichle wale se ${elemSize} bytes aage hai.`,
        analogyTitle: 'Train Ke Connected Dibbe',
        analogyText: `Array bilkul train ke dibbo ki tarah hai! Sabhi dibbe (cells) ek ke baad ek jude hue hain. Train ka ek naam hai ('${arrName}') aur har seat ka ek number hai index [0], [1], [2].`,
        analogyIcon: 'Grid',
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
        { name: 'id', type: 'int', value: vals[0] || '101', offset: 0 },
        { name: 'name', type: 'char[20]', value: vals[1] || 'Rahul', offset: 4 },
        { name: 'marks', type: 'float', value: vals[2] || '88.5', offset: 24 },
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
        variables: Array.from(variables.values()),
        pointers: [...pointers],
        arrays: Array.from(arrays.values()),
        structures: Array.from(structures.values()),
        callStack: ['main()'],
        stdout: stdoutAccumulator,
        hinglishExplanation: `'struct ${structType}' ne alag-alag data types (int, string, float) ko ek single packet '${varName}' me pack kar diya hai. Memory address ${baseAddr} par poora record store hai.`,
        analogyTitle: 'Student Biodata / ID Card',
        analogyText: 'Structure ek Student ID card ki tarah hai jisme ek hi card par student ka Roll No (int), Naam (string), aur Attendance Percentage (float) ek sath store hota hai.',
        analogyIcon: 'CreditCard',
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
          ? `Pointer '${ptrName}' now stores address of '${targetVarName}' (${targetAddr})`
          : `Declared pointer variable '${ptrName}' (uninitialized / NULL)`,
        variables: Array.from(variables.values()),
        pointers: [...pointers],
        arrays: Array.from(arrays.values()),
        structures: Array.from(structures.values()),
        callStack: ['main()'],
        stdout: stdoutAccumulator,
        hinglishExplanation: targetVarName
          ? `Pointer '${ptrName}' ne '${targetVarName}' ka memory address (${targetAddr}) store kiya. Ab '${ptrName}' seedha '${targetVarName}' ki memory location ko point kar raha hai!`
          : `Pointer '${ptrName}' ban chuka hai. Yeh kisi normal number ko nahi, balki memory address ko hold karega.`,
        analogyTitle: 'Ghar Ka Address (GPS Parchi)',
        analogyText: `Pointer ek parchi (slip) ki tarah hai. Parchi me saman nahi hota, balki kisi doosre ke ghar ka address likha hota hai (${targetAddr}). Jab aap *${ptrName} bolte ho, to aap us ghar me rakha saman dekh rahe ho!`,
        analogyIcon: 'Navigation',
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
          actionDescription: `Dereferenced *${ptrName} and updated target variable '${link.toVar}' to ${newVal}`,
          variables: Array.from(variables.values()),
          pointers: [...pointers],
          arrays: Array.from(arrays.values()),
          structures: Array.from(structures.values()),
          callStack: ['main()'],
          stdout: stdoutAccumulator,
          hinglishExplanation: `*${ptrName} ka matlab hai: "${ptrName} jis address par point kar raha hai (${link.toAddress}), us address par jaao aur value ko badal kar ${newVal} kar do". '${link.toVar}' ki value automatically badal gayi!`,
          analogyTitle: 'Remote Se TV Ka Channel Badalna',
          analogyText: 'Aapne TV ko haath nahi lagaya, bas Remote (*ptr) se button dabaya aur TV (target variable) ka channel (value) badal gaya!',
          analogyIcon: 'Tv',
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
        val = evalMathSimple(initValStr, variables);
      }

      variables.set(varName, {
        name: varName,
        type,
        value: val,
        address: addr,
        byteSize,
        highlight: true,
      });

      steps.push({
        stepIndex: steps.length + 1,
        lineNumber: lineNum,
        codeLine: rawLine,
        actionDescription: `Declared ${type} variable '${varName}' with value ${val} at address ${addr}`,
        variables: Array.from(variables.values()),
        pointers: [...pointers],
        arrays: Array.from(arrays.values()),
        structures: Array.from(structures.values()),
        callStack: ['main()'],
        stdout: stdoutAccumulator,
        hinglishExplanation: `RAM me ek naya memory slot book hua. Name '${varName}', Type '${type}' (${byteSize} bytes), Address '${addr}', aur value '${val}' store ho gayi.`,
        analogyTitle: 'Labeled Dabba (Container)',
        analogyText: `Variable ek dabba hai jiske upar label laga hai '${varName}'. Is dabbe me sirf '${type}' type ka saman aa sakta hai, aur abhi isme '${val}' rakha hai.`,
        analogyIcon: 'Box',
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
          variables: Array.from(variables.values()),
          pointers: [...pointers],
          arrays: Array.from(arrays.values()),
          structures: Array.from(structures.values()),
          callStack: ['main()'],
          stdout: stdoutAccumulator,
          hinglishExplanation: `'${varName}' ke purane data (${oldVal}) ko overwrite karke naya data (${newVal}) daal diya gaya. Memory address (${targetVar.address}) wahi raha.`,
          analogyTitle: 'Dabbe Ka Saman Badla',
          analogyText: `Dabba wahi hai, address wahi hai, bas dabbe ke andar ka purana saman nikaal kar naya saman (${newVal}) rakh diya gaya.`,
          analogyIcon: 'RefreshCw',
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
          ? `Condition (${condition}) TRUE nikli! Isliye program 'if' block ke andar jayega aur uske andar ka code chalega.`
          : `Condition (${condition}) FALSE ho gayi! Isliye 'if' block ka code skip hoga aur program aage badhega (ya 'else' block me jayega).`,
        analogyTitle: 'Traffic Signal & Road Fork',
        analogyText: evaluated
          ? 'Signal GREEN hai! Gaadi aage chal sakti hai (if block execute ho raha hai).'
          : 'Signal RED hai! Ye rasta band hai, dusre raste (else) par jaana padega.',
        analogyIcon: 'GitFork',
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
        hinglishExplanation: `Switch statement '${expr}' ki value (${val}) ko check kar raha hai. Yeh seedha 'case ${val}:' par jump karega bina beech ke cases ko ek-ek karke check kiye!`,
        analogyTitle: 'TV Remote Ka Channel Button',
        analogyText: 'TV Remote par jab aap button 3 dabate ho, to direct Channel 3 khulta hai, aapko 1 aur 2 channel dekhne ki zaroorat nahi hoti. Yehi switch case ka magic hai!',
        analogyIcon: 'LayoutList',
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
        variables: Array.from(variables.values()),
        pointers: [...pointers],
        arrays: Array.from(arrays.values()),
        structures: Array.from(structures.values()),
        callStack: ['main()'],
        stdout: stdoutAccumulator,
        hinglishExplanation: `Target case ${caseVal} match ho gaya. Ab is case ke instructions run honge jab tak 'break' nahi milta.`,
        analogyTitle: 'Restaurant Menu Order',
        analogyText: 'Waiter ne menu me se aapka exact order (Case) identify kar liya hai aur ab wo item kitchen me ban raha hai.',
        analogyIcon: 'CheckCircle2',
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
            ? `Iteration #${iter + 1}: '${varName}' ki value ${currentVal} hai. Condition '${condStr}' TRUE hai, isliye loop ka body phir se chalega.`
            : `Loop complete! '${varName}' ki value ${currentVal} hone par condition FALSE ho gayi, aur program loop se bahar nikal gaya.`,
          analogyTitle: 'Chhat (Terrace) Ke Chakkar',
          analogyText: conditionMet
            ? `Ye aapka chakkar number #${iter + 1} hai. Abhi round target baki hai, isliye daudte raho!`
            : 'Sare chakkar complete ho gaye! Ab daudna band karke aage badho.',
          analogyIcon: 'RotateCw',
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

      steps.push({
        stepIndex: steps.length + 1,
        lineNumber: lineNum,
        codeLine: rawLine,
        actionDescription: `Standard Output printed: "${outputText.trim()}"`,
        variables: Array.from(variables.values()),
        pointers: [...pointers],
        arrays: Array.from(arrays.values()),
        structures: Array.from(structures.values()),
        callStack: ['main()'],
        stdout: stdoutAccumulator,
        hinglishExplanation: `printf() ne terminal screen par text print kar diya. OS stdout buffer update hua.`,
        analogyTitle: 'Classroom Ka Loudspeaker',
        analogyText: 'printf program ka loudspeaker hai - jo bhi message isme pass karoge wo terminal screen par sabko sunayi/dikhayi dega.',
        analogyIcon: 'Megaphone',
      });
      continue;
    }

    // 12. Return statement: return 0;
    if (trimmed.startsWith('return')) {
      steps.push({
        stepIndex: steps.length + 1,
        lineNumber: lineNum,
        codeLine: rawLine,
        actionDescription: 'return 0: main() finished successfully, returning exit code 0 to OS',
        variables: Array.from(variables.values()),
        pointers: [...pointers],
        arrays: Array.from(arrays.values()),
        structures: Array.from(structures.values()),
        callStack: [],
        stdout: stdoutAccumulator,
        hinglishExplanation: 'return 0 ka matlab program bina kisi error ke successfully finish ho gaya hai. Stack frame memory se clean ho gaya.',
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
