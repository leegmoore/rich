import { describe, it, expect } from 'vitest';
import { Columns } from '../src/columns.js';
import { Console } from '../src/console.js';

const COLUMN_DATA = [
  'Ursus americanus',
  'American buffalo',
  'Bison bison',
  'American crow',
  'Corvus brachyrhynchos',
  'American marten',
  'Martes americana',
  'American racer',
  'Coluber constrictor',
  'American woodcock',
  'Scolopax minor',
  'Anaconda (unidentified)',
  'Eunectes sp.',
  'Andean goose',
  'Chloephaga melanoptera',
  'Ant',
  'Anteater, australian spiny',
  'Tachyglossus aculeatus',
  'Anteater, giant',
];

function render(): string {
  const console = new Console({ width: 100, legacy_windows: false });

  console.beginCapture();
  console.rule('empty');
  const emptyColumns = new Columns([]);
  console.print(emptyColumns);
  const columns = new Columns(COLUMN_DATA);
  columns.addRenderable('Myrmecophaga tridactyla');
  console.rule('optimal');
  console.print(columns);
  console.rule('optimal, expand');
  columns.expand = true;
  console.print(columns);
  console.rule('column first, optimal');
  columns.columnFirst = true;
  columns.expand = false;
  console.print(columns);
  console.rule('column first, right to left');
  columns.rightToLeft = true;
  console.print(columns);
  console.rule('equal columns, expand');
  columns.equal = true;
  columns.expand = true;
  console.print(columns);
  console.rule('fixed width');
  columns.width = 16;
  columns.expand = false;
  console.print(columns);
  console.print();
  return console.endCapture();
}

describe('Columns', () => {
  it('test_render', () => {
    const expected =
      '────────────────────────────────────────────── empty ───────────────────────────────────────────────\n' +
      '───────────────────────────────────────────── optimal ──────────────────────────────────────────────\n' +
      'Ursus americanus           American buffalo       Bison bison            American crow          \n' +
      'Corvus brachyrhynchos      American marten        Martes americana       American racer         \n' +
      'Coluber constrictor        American woodcock      Scolopax minor         Anaconda (unidentified)\n' +
      'Eunectes sp.               Andean goose           Chloephaga melanoptera Ant                    \n' +
      'Anteater, australian spiny Tachyglossus aculeatus Anteater, giant        Myrmecophaga tridactyla\n' +
      '───────────────────────────────────────── optimal, expand ──────────────────────────────────────────\n' +
      'Ursus americanus             American buffalo        Bison bison             American crow          \n' +
      'Corvus brachyrhynchos        American marten         Martes americana        American racer         \n' +
      'Coluber constrictor          American woodcock       Scolopax minor          Anaconda (unidentified)\n' +
      'Eunectes sp.                 Andean goose            Chloephaga melanoptera  Ant                    \n' +
      'Anteater, australian spiny   Tachyglossus aculeatus  Anteater, giant         Myrmecophaga tridactyla\n' +
      '────────────────────────────────────── column first, optimal ───────────────────────────────────────\n' +
      'Ursus americanus      American marten     Scolopax minor          Ant                       \n' +
      'American buffalo      Martes americana    Anaconda (unidentified) Anteater, australian spiny\n' +
      'Bison bison           American racer      Eunectes sp.            Tachyglossus aculeatus    \n' +
      'American crow         Coluber constrictor Andean goose            Anteater, giant           \n' +
      'Corvus brachyrhynchos American woodcock   Chloephaga melanoptera  Myrmecophaga tridactyla   \n' +
      '─────────────────────────────────── column first, right to left ────────────────────────────────────\n' +
      'Ant                        Scolopax minor          American marten     Ursus americanus     \n' +
      'Anteater, australian spiny Anaconda (unidentified) Martes americana    American buffalo     \n' +
      'Tachyglossus aculeatus     Eunectes sp.            American racer      Bison bison          \n' +
      'Anteater, giant            Andean goose            Coluber constrictor American crow        \n' +
      'Myrmecophaga tridactyla    Chloephaga melanoptera  American woodcock   Corvus brachyrhynchos\n' +
      '────────────────────────────────────── equal columns, expand ───────────────────────────────────────\n' +
      'Chloephaga melanoptera                American racer                    Ursus americanus            \n' +
      'Ant                                   Coluber constrictor               American buffalo            \n' +
      'Anteater, australian spiny            American woodcock                 Bison bison                 \n' +
      'Tachyglossus aculeatus                Scolopax minor                    American crow               \n' +
      'Anteater, giant                       Anaconda (unidentified)           Corvus brachyrhynchos       \n' +
      'Myrmecophaga tridactyla               Eunectes sp.                      American marten             \n' +
      '                                      Andean goose                      Martes americana            \n' +
      '─────────────────────────────────────────── fixed width ────────────────────────────────────────────\n' +
      'Anteater,         Eunectes sp.     Coluber          Corvus           Ursus americanus \n' +
      'australian spiny                   constrictor      brachyrhynchos                    \n' +
      'Tachyglossus      Andean goose     American         American marten  American buffalo \n' +
      'aculeatus                          woodcock                                           \n' +
      'Anteater, giant   Chloephaga       Scolopax minor   Martes americana Bison bison      \n' +
      '                  melanoptera                                                         \n' +
      'Myrmecophaga      Ant              Anaconda         American racer   American crow    \n' +
      'tridactyla                         (unidentified)                                     \n' +
      '\n';
    expect(render()).toBe(expected);
  });
});
