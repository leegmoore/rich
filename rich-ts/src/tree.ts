import { loopFirst, loopLast } from './_loop.js';
import type { Console, ConsoleOptions, RenderResult, RenderableType } from './console.js';
import { Measurement } from './measure.js';
import { Segment } from './segment.js';
import { Style, StyleStack, StyleType } from './style.js';
import { Styled } from './styled.js';

type GuideType = [string, string, string, string];

export interface TreeOptions {
  style?: StyleType;
  guideStyle?: StyleType;
  expanded?: boolean;
  highlight?: boolean;
  hideRoot?: boolean;
}

export interface TreeAddOptions {
  style?: StyleType;
  guideStyle?: StyleType;
  expanded?: boolean;
  highlight?: boolean;
}

const enum GuideIndex {
  SPACE = 0,
  CONTINUE = 1,
  FORK = 2,
  END = 3,
}

export class Tree {
  static readonly ASCII_GUIDES: GuideType = ['    ', '|   ', '+-- ', '`-- '] as const;

  static readonly TREE_GUIDES: readonly GuideType[] = [
    ['    ', '│   ', '├── ', '└── '],
    ['    ', '┃   ', '┣━━ ', '┗━━ '],
    ['    ', '║   ', '╠══ ', '╚══ '],
  ];

  readonly label: RenderableType;
  readonly style: StyleType;
  readonly guideStyle: StyleType;
  readonly children: Tree[] = [];
  expanded: boolean;
  readonly highlight: boolean;
  readonly hideRoot: boolean;

  constructor(label: RenderableType, options: TreeOptions = {}) {
    this.label = label;
    this.style = options.style ?? 'tree';
    this.guideStyle = options.guideStyle ?? 'tree.line';
    this.expanded = options.expanded ?? true;
    this.highlight = options.highlight ?? false;
    this.hideRoot = options.hideRoot ?? false;
  }

  add(label: RenderableType, options: TreeAddOptions = {}): Tree {
    const child = new Tree(label, {
      style: options.style ?? this.style,
      guideStyle: options.guideStyle ?? this.guideStyle,
      expanded: options.expanded ?? true,
      highlight: options.highlight ?? this.highlight,
    });
    this.children.push(child);
    return child;
  }

  *__richConsole__(console: Console, options: ConsoleOptions): RenderResult {
    const stack: Array<Iterator<[boolean, Tree]>> = [];
    stack.push(loopLast([this]));

    const newLine = Segment.line();
    const nullStyle = Style.null();
    const baseGuideStyle = console.getStyle(this.guideStyle, nullStyle);
    const guideStyleStack = new StyleStack(baseGuideStyle);
    const baseStyle = console.getStyle(this.style, nullStyle);
    const styleStack = new StyleStack(baseStyle);
    const removeGuideStyles = new Style({ bold: false, underline2: false });

    const makeGuide = (index: GuideIndex, style: Style): Segment => {
      if (options.asciiOnly) {
        return new Segment(Tree.ASCII_GUIDES[index], style);
      }
      const guideSetIndex = options.legacyWindows ? 0 : style.bold ? 1 : style.underline2 ? 2 : 0;
      const guideSet = Tree.TREE_GUIDES[guideSetIndex];
      if (!guideSet) {
        return new Segment(Tree.ASCII_GUIDES[index], style);
      }
      const line = guideSet[index] ?? guideSet[GuideIndex.SPACE];
      return new Segment(line, style);
    };

    const levels: Segment[] = [makeGuide(GuideIndex.CONTINUE, baseGuideStyle)];
    let depth = 0;

    while (stack.length) {
      const iterator = stack.pop()!;
      const result = iterator.next();
      if (result.done) {
        levels.pop();
        if (levels.length) {
          const previousStyle = levels[levels.length - 1]?.style ?? nullStyle;
          levels[levels.length - 1] = makeGuide(GuideIndex.FORK, previousStyle);
          guideStyleStack.pop();
          styleStack.pop();
        }
        continue;
      }

      stack.push(iterator);
      const [isLast, node] = result.value;

      if (levels.length) {
        const currentStyle = levels[levels.length - 1]?.style ?? nullStyle;
        levels[levels.length - 1] = isLast
          ? makeGuide(GuideIndex.END, currentStyle)
          : levels[levels.length - 1]!;
      }

      const nodeGuideStyleDelta = console.getStyle(node.guideStyle, nullStyle);
      const combinedGuideStyle = guideStyleStack.current.add(nodeGuideStyleDelta);
      const nodeStyleDelta = console.getStyle(node.style, nullStyle);
      const combinedStyle = styleStack.current.add(nodeStyleDelta);

      const prefixStart = this.hideRoot ? 2 : 1;
      const prefixSegments = levels.slice(prefixStart);
      const prefixWidth = prefixSegments.reduce((total, segment) => total + segment.cellLength, 0);
      const availableWidth = Math.max(1, options.maxWidth - prefixWidth);
      const renderOptions = options.update({
        width: availableWidth,
        highlight: this.highlight,
        height: undefined,
      });
      const renderableLines = console.renderLines(
        new Styled(node.label, combinedStyle),
        renderOptions,
        undefined,
        false
      );
      const hasContinuation = renderableLines.length > 1;

      if (!(depth === 0 && this.hideRoot)) {
        for (const [isFirstLine, line] of loopFirst(renderableLines)) {
          if (prefixSegments.length) {
            const backgroundStyle = combinedStyle.backgroundStyle;
            for (const segment of Segment.applyStyle(
              prefixSegments,
              backgroundStyle,
              removeGuideStyles
            )) {
              yield segment;
            }
          }
          yield* line;
          yield newLine;
          if (isFirstLine && prefixSegments.length && hasContinuation) {
            const lastPrefixStyle = prefixSegments[prefixSegments.length - 1]?.style ?? nullStyle;
            const updatedGuide = makeGuide(
              isLast ? GuideIndex.SPACE : GuideIndex.CONTINUE,
              lastPrefixStyle
            );
            prefixSegments[prefixSegments.length - 1] = updatedGuide;
            const lastPrefixIndex = prefixStart + prefixSegments.length - 1;
            if (lastPrefixIndex >= 0 && lastPrefixIndex < levels.length) {
              levels[lastPrefixIndex] = updatedGuide;
            }
          }
        }
      }

      if (node.expanded && node.children.length) {
        const lastLevelStyle = levels[levels.length - 1]?.style ?? nullStyle;
        levels[levels.length - 1] = makeGuide(
          isLast ? GuideIndex.SPACE : GuideIndex.CONTINUE,
          lastLevelStyle
        );
        levels.push(
          makeGuide(
            node.children.length === 1 ? GuideIndex.END : GuideIndex.FORK,
            combinedGuideStyle
          )
        );
        styleStack.push(nodeStyleDelta);
        guideStyleStack.push(nodeGuideStyleDelta);
        stack.push(loopLast(node.children));
        depth += 1;
      }
    }
  }

  __richMeasure__(console: Console, options: ConsoleOptions): Measurement {
    const stack: Array<Iterator<Tree>> = [
      (function* (tree: Tree) {
        yield tree;
      })(this),
    ];
    let minimum = 0;
    let maximum = 0;
    let level = 0;

    while (stack.length) {
      const iterator = stack.pop()!;
      const result = iterator.next();
      if (result.done) {
        level = Math.max(0, level - 1);
        continue;
      }
      stack.push(iterator);
      const tree = result.value;
      const measurement = Measurement.get(console, options, tree.label);
      const indent = level * 4;
      minimum = Math.max(minimum, measurement.minimum + indent);
      maximum = Math.max(maximum, measurement.maximum + indent);
      if (tree.expanded && tree.children.length) {
        stack.push(tree.children[Symbol.iterator]());
        level += 1;
      }
    }

    return new Measurement(minimum, maximum);
  }
}
