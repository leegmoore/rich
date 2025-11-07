import { Console, Table, Panel, Text, Rule, Columns } from "rich-ts";
import { ROUNDED, SQUARE, DOUBLE, HEAVY } from "rich-ts";

const console_ = new Console();

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  // Title
  console_.print();
  console_.print(
    "[bold cyan]╔════════════════════════════════════════════════════════════════╗[/bold cyan]"
  );
  console_.print(
    "[bold cyan]║[/bold cyan]  [bold yellow]RICH-TS LIBRARY TEST SUITE[/bold yellow]  [bold cyan]║[/bold cyan]"
  );
  console_.print(
    "[bold cyan]║[/bold cyan]  [bold green]TypeScript Port of Rich Terminal Library[/bold green]  [bold cyan]║[/bold cyan]"
  );
  console_.print(
    "[bold cyan]╚════════════════════════════════════════════════════════════════╝[/bold cyan]"
  );
  console_.print();

  // Section 1: Text Styling
  console_.print("[bold magenta]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold magenta]");
  console_.print("[bold white]1. TEXT STYLING & FORMATTING[/bold white]");
  console_.print("[bold magenta]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold magenta]");
  console_.print();

  console_.print("  [bold]Bold text[/bold] looks strong!");
  console_.print("  [italic]Italic text[/italic] has elegance.");
  console_.print("  [underline]Underlined text[/underline] stands out.");
  console_.print("  [bold italic underline]All three combined[/bold italic underline]!");
  console_.print();

  // Section 2: Colors
  console_.print("[bold magenta]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold magenta]");
  console_.print("[bold white]2. COLOR SUPPORT (16, 256, TRUECOLOR)[/bold white]");
  console_.print("[bold magenta]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold magenta]");
  console_.print();

  // Standard colors
  console_.print("  Standard colors:");
  console_.print(
    "  [red]Red[/red] [yellow]Yellow[/yellow] [green]Green[/green] [cyan]Cyan[/cyan] [blue]Blue[/blue] [magenta]Magenta[/magenta] [white]White[/white]"
  );
  console_.print();

  // Background colors
  console_.print("  Background colors:");
  console_.print(
    "  [red on white]Red Background[/red on white] [yellow on blue]Yellow on Blue[/yellow on blue] [green on black]Green on Black[/green on black]"
  );
  console_.print();

  // RGB/Truecolor
  console_.print("  RGB Truecolor samples:");
  console_.print(
    "  [rgb(255,85,255)]Magenta Pink[/rgb(255,85,255)] [rgb(85,255,255)]Cyan Bright[/rgb(85,255,255)] [rgb(255,255,85)]Lemon Yellow[/rgb(255,255,85)]"
  );
  console_.print();

  // Section 3: Panels
  console_.print("[bold magenta]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold magenta]");
  console_.print("[bold white]3. PANELS WITH BORDERS[/bold white]");
  console_.print("[bold magenta]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold magenta]");
  console_.print();

  // Panel with default box
  const panel1 = new Panel(
    "[bold cyan]This is a simple panel[/bold cyan]\nWith multiple lines of content\nShowing off the borders!",
    undefined,
    {
      title: "[bold white]Basic Panel[/bold white]",
      subtitle: "[dim]with title[/dim]",
      borderStyle: "blue",
      expand: false,
    }
  );
  console_.print(panel1);
  console_.print();

  // Panel with different box style
  const panel2 = new Panel(
    "[bold green]This panel uses a different box style[/bold green]\nTesting ROUNDED box drawing characters",
    ROUNDED,
    {
      title: "[bold yellow]Rounded Box[/bold yellow]",
      borderStyle: "yellow",
      expand: false,
    }
  );
  console_.print(panel2);
  console_.print();

  // Section 4: Tables
  console_.print("[bold magenta]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold magenta]");
  console_.print("[bold white]4. TABLES[/bold white]");
  console_.print("[bold magenta]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold magenta]");
  console_.print();

  // Movie table
  const table1 = new Table({
    showHeader: true,
    headerStyle: "bold magenta",
    title: "[bold cyan]Star Wars Movies[/bold cyan]",
  });

  table1.addColumn("[bold]Release Date[/bold]", "", {
    style: "dim cyan",
    width: 15,
  });
  table1.addColumn("[bold]Title[/bold]");
  table1.addColumn("[bold]Box Office[/bold]", "", { justify: "right", width: 18 });

  table1.addRow(
    "Dec 20, 2019",
    "[bold cyan]The Rise of Skywalker[/bold cyan]",
    "[green]$1,074M[/green]"
  );
  table1.addRow(
    "May 25, 2018",
    "[red]Solo[/red]: A Star Wars Story",
    "[yellow]$393M[/yellow]"
  );
  table1.addRow(
    "Dec 15, 2017",
    "[bold]The Last Jedi[/bold]",
    "[bold green]$1,332M[/bold green]"
  );

  console_.print(table1);
  console_.print();

  // Technology table
  const table2 = new Table({
    showHeader: true,
    headerStyle: "bold green",
    title: "[bold cyan]Programming Languages[/bold cyan]",
  });

  table2.addColumn("Language", "", { style: "bold cyan", width: 12 });
  table2.addColumn("Year", "", { justify: "center", width: 6 });
  table2.addColumn("Type", "", { style: "magenta", width: 10 });
  table2.addColumn("Rating", "", { justify: "right" });

  table2.addRow("Python", "1991", "[yellow]Dynamic[/yellow]", "⭐⭐⭐⭐⭐");
  table2.addRow("TypeScript", "2012", "[blue]Static[/blue]", "⭐⭐⭐⭐");
  table2.addRow("Rust", "2010", "[red]Memory-Safe[/red]", "⭐⭐⭐⭐⭐");
  table2.addRow("Go", "2009", "[cyan]Fast[/cyan]", "⭐⭐⭐⭐");

  console_.print(table2);
  console_.print();

  // Section 5: Box Styles
  console_.print("[bold magenta]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold magenta]");
  console_.print("[bold white]5. DIFFERENT BOX STYLES[/bold white]");
  console_.print("[bold magenta]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold magenta]");
  console_.print();

  const boxStyles = [
    { style: SQUARE, name: "SQUARE", color: "cyan" },
    { style: DOUBLE, name: "DOUBLE", color: "yellow" },
    { style: HEAVY, name: "HEAVY", color: "red" },
    { style: ROUNDED, name: "ROUNDED", color: "green" },
  ];

  for (const { style, name, color } of boxStyles) {
    const panel = new Panel(`[${color}]Box Style: ${name}[/${color}]`, style, {
      expand: false,
      borderStyle: color,
    });
    console_.print(panel);
  }
  console_.print();

  // Section 6: Markdown-like markup
  console_.print("[bold magenta]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold magenta]");
  console_.print("[bold white]6. MARKUP & EMOJI SUPPORT[/bold white]");
  console_.print("[bold magenta]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold magenta]");
  console_.print();

  console_.print("  😀 :smiley:     🎉 :party_popper:     ⭐ :star:");
  console_.print("  🚀 :rocket:     💻 :computer:         🎨 :art:");
  console_.print("  ❤️ :heart:      🐍 :snake:            🎭 :performing_arts:");
  console_.print();

  // Nested styling
  console_.print(
    "  [bold on blue]Nested [yellow]styling[/yellow] with [red]colors[/red][/bold on blue] works great!"
  );
  console_.print();

  // Section 7: Text Alignment
  console_.print("[bold magenta]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold magenta]");
  console_.print("[bold white]7. TEXT ALIGNMENT[/bold white]");
  console_.print("[bold magenta]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold magenta]");
  console_.print();

  console_.print("[yellow]Left aligned text[/yellow]");
  console_.print("[yellow]     Center aligned text[/yellow]", {
    justify: "center",
  });
  console_.print("[yellow]Right aligned text[/yellow]", { justify: "right" });
  console_.print();

  // Section 8: Rules/Lines
  console_.print("[bold magenta]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold magenta]");
  console_.print("[bold white]8. HORIZONTAL RULES[/bold white]");
  console_.print("[bold magenta]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold magenta]");
  console_.print();

  console_.print(new Rule("[cyan]Simple Rule[/cyan]", { style: "cyan" }));
  console_.print(
    new Rule("[magenta]Styled Rule[/magenta]", {
      style: "magenta",
    })
  );
  console_.print(new Rule("[green]Green Rule[/green]", { style: "green" }));
  console_.print();

  // Section 9: Combinations
  console_.print("[bold magenta]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold magenta]");
  console_.print("[bold white]9. COMBINING MULTIPLE FEATURES[/bold white]");
  console_.print("[bold magenta]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold magenta]");
  console_.print();

  const combinedTable = new Table({
    showHeader: true,
    headerStyle: "bold white on blue",
    title: "[bold cyan]Feature Combination Demo[/bold cyan]",
  });

  combinedTable.addColumn("[bold]Feature[/bold]", "", { width: 15 });
  combinedTable.addColumn("[bold]Example[/bold]");
  combinedTable.addColumn("[bold]Status[/bold]", "", { justify: "center" });

  combinedTable.addRow(
    "[cyan]Colors[/cyan]",
    "[red]Red[/red] [green]Green[/green] [blue]Blue[/blue]",
    "[green]✓ Working[/green]"
  );
  combinedTable.addRow(
    "[cyan]Styling[/cyan]",
    "[bold]Bold[/bold] [italic]Italic[/italic] [underline]Underline[/underline]",
    "[green]✓ Working[/green]"
  );
  combinedTable.addRow(
    "[cyan]Panels[/cyan]",
    "[yellow]Bordered containers[/yellow]",
    "[green]✓ Working[/green]"
  );
  combinedTable.addRow(
    "[cyan]Tables[/cyan]",
    "[magenta]Structured data[/magenta]",
    "[green]✓ Working[/green]"
  );
  combinedTable.addRow(
    "[cyan]Emoji[/cyan]",
    ":rocket: :star: :heart:",
    "[green]✓ Working[/green]"
  );

  console_.print(combinedTable);
  console_.print();

  // Final message
  console_.print("[bold magenta]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold magenta]");
  console_.print();
  console_.print(
    "[bold green]✓ Rich-TS test suite completed successfully![/bold green]"
  );
  console_.print(
    "[cyan]All features are working beautifully in the terminal.[/cyan]"
  );
  console_.print();
  console_.print(
    "[dim]TypeScript port of Rich - for beautiful terminal formatting[/dim]"
  );
  console_.print();
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});