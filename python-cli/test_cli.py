#!/usr/bin/env python3
"""
Rich Library Test Suite - Python Version
Test script to compare with TypeScript port
"""

from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.rule import Rule
from rich.box import (
    SQUARE, ROUNDED, DOUBLE, HEAVY
)

console = Console()

def main():
    # Title
    console.print()
    console.print(
        "[bold cyan]╔════════════════════════════════════════════════════════════════╗[/bold cyan]"
    )
    console.print(
        "[bold cyan]║[/bold cyan]  [bold yellow]RICH LIBRARY TEST SUITE (PYTHON)[/bold yellow]  [bold cyan]║[/bold cyan]"
    )
    console.print(
        "[bold cyan]║[/bold cyan]  [bold green]Original Rich Terminal Library[/bold green]  [bold cyan]║[/bold cyan]"
    )
    console.print(
        "[bold cyan]╚════════════════════════════════════════════════════════════════╝[/bold cyan]"
    )
    console.print()

    # Section 1: Text Styling
    console.print("[bold magenta]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold magenta]")
    console.print("[bold white]1. TEXT STYLING & FORMATTING[/bold white]")
    console.print("[bold magenta]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold magenta]")
    console.print()

    console.print("  [bold]Bold text[/bold] looks strong!")
    console.print("  [italic]Italic text[/italic] has elegance.")
    console.print("  [underline]Underlined text[/underline] stands out.")
    console.print("  [bold italic underline]All three combined[/bold italic underline]!")
    console.print()

    # Section 2: Colors
    console.print("[bold magenta]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold magenta]")
    console.print("[bold white]2. COLOR SUPPORT (16, 256, TRUECOLOR)[/bold white]")
    console.print("[bold magenta]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold magenta]")
    console.print()

    # Standard colors
    console.print("  Standard colors:")
    console.print(
        "  [red]Red[/red] [yellow]Yellow[/yellow] [green]Green[/green] [cyan]Cyan[/cyan] [blue]Blue[/blue] [magenta]Magenta[/magenta] [white]White[/white]"
    )
    console.print()

    # Background colors
    console.print("  Background colors:")
    console.print(
        "  [red on white]Red Background[/red on white] [yellow on blue]Yellow on Blue[/yellow on blue] [green on black]Green on Black[/green on black]"
    )
    console.print()

    # RGB/Truecolor
    console.print("  RGB Truecolor samples:")
    console.print(
        "  [rgb(255,85,255)]Magenta Pink[/rgb(255,85,255)] [rgb(85,255,255)]Cyan Bright[/rgb(85,255,255)] [rgb(255,255,85)]Lemon Yellow[/rgb(255,255,85)]"
    )
    console.print()

    # Section 3: Panels
    console.print("[bold magenta]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold magenta]")
    console.print("[bold white]3. PANELS WITH BORDERS[/bold white]")
    console.print("[bold magenta]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold magenta]")
    console.print()

    # Panel with default box
    panel1 = Panel(
        "[bold cyan]This is a simple panel[/bold cyan]\nWith multiple lines of content\nShowing off the borders!",
        title="[bold white]Basic Panel[/bold white]",
        subtitle="[dim]with title[/dim]",
        border_style="blue",
        expand=False,
    )
    console.print(panel1)
    console.print()

    # Panel with different box style
    panel2 = Panel(
        "[bold green]This panel uses a different box style[/bold green]\nTesting ROUNDED box drawing characters",
        title="[bold yellow]Rounded Box[/bold yellow]",
        border_style="yellow",
        box=ROUNDED,
        expand=False,
    )
    console.print(panel2)
    console.print()

    # Section 4: Tables
    console.print("[bold magenta]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold magenta]")
    console.print("[bold white]4. TABLES[/bold white]")
    console.print("[bold magenta]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold magenta]")
    console.print()

    # Movie table
    table1 = Table(show_header=True, header_style="bold magenta", title="Star Wars Movies")
    table1.add_column("[bold]Release Date[/bold]", style="dim cyan", width=15)
    table1.add_column("[bold]Title[/bold]")
    table1.add_column("[bold]Box Office[/bold]", justify="right", width=18)

    table1.add_row(
        "Dec 20, 2019",
        "[bold cyan]The Rise of Skywalker[/bold cyan]",
        "[green]$1,074M[/green]",
    )
    table1.add_row(
        "May 25, 2018",
        "[red]Solo[/red]: A Star Wars Story",
        "[yellow]$393M[/yellow]",
    )
    table1.add_row(
        "Dec 15, 2017",
        "[bold]The Last Jedi[/bold]",
        "[bold green]$1,332M[/bold green]",
    )

    console.print(table1)
    console.print()

    # Technology table
    table2 = Table(show_header=True, header_style="bold green", title="Programming Languages")
    table2.add_column("Language", style="bold cyan", width=12)
    table2.add_column("Year", justify="center", width=6)
    table2.add_column("Type", style="magenta", width=10)
    table2.add_column("Rating", justify="right")

    table2.add_row("Python", "1991", "[yellow]Dynamic[/yellow]", "⭐⭐⭐⭐⭐")
    table2.add_row("TypeScript", "2012", "[blue]Static[/blue]", "⭐⭐⭐⭐")
    table2.add_row("Rust", "2010", "[red]Memory-Safe[/red]", "⭐⭐⭐⭐⭐")
    table2.add_row("Go", "2009", "[cyan]Fast[/cyan]", "⭐⭐⭐⭐")

    console.print(table2)
    console.print()

    # Section 5: Box Styles
    console.print("[bold magenta]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold magenta]")
    console.print("[bold white]5. DIFFERENT BOX STYLES[/bold white]")
    console.print("[bold magenta]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold magenta]")
    console.print()

    box_styles = [
        (SQUARE, "SQUARE", "cyan"),
        (DOUBLE, "DOUBLE", "yellow"),
        (HEAVY, "HEAVY", "red"),
        (ROUNDED, "ROUNDED", "green"),
    ]

    for box_style, name, color in box_styles:
        panel = Panel(
            f"[{color}]Box Style: {name}[/{color}]",
            box=box_style,
            expand=False,
            border_style=color,
        )
        console.print(panel)

    console.print()

    # Section 6: Markdown-like markup
    console.print("[bold magenta]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold magenta]")
    console.print("[bold white]6. MARKUP & EMOJI SUPPORT[/bold white]")
    console.print("[bold magenta]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold magenta]")
    console.print()

    console.print("  😀 :smiley:     🎉 :party_popper:     ⭐ :star:")
    console.print("  🚀 :rocket:     💻 :computer:         🎨 :art:")
    console.print("  ❤️ :heart:      🐍 :snake:            🎭 :performing_arts:")
    console.print()

    # Nested styling
    console.print(
        "  [bold on blue]Nested [yellow]styling[/yellow] with [red]colors[/red][/bold on blue] works great!"
    )
    console.print()

    # Section 7: Text Alignment
    console.print("[bold magenta]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold magenta]")
    console.print("[bold white]7. TEXT ALIGNMENT[/bold white]")
    console.print("[bold magenta]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold magenta]")
    console.print()

    console.print("[yellow]Left aligned text[/yellow]")
    console.print("[yellow]Center aligned text[/yellow]", justify="center")
    console.print("[yellow]Right aligned text[/yellow]", justify="right")
    console.print()

    # Section 8: Rules/Lines
    console.print("[bold magenta]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold magenta]")
    console.print("[bold white]8. HORIZONTAL RULES[/bold white]")
    console.print("[bold magenta]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold magenta]")
    console.print()

    console.print(Rule("[cyan]Simple Rule[/cyan]", style="cyan"))
    console.print(Rule("[magenta]Styled Rule[/magenta]", style="magenta"))
    console.print(Rule("[green]Green Rule[/green]", style="green"))
    console.print()

    # Section 9: Combinations
    console.print("[bold magenta]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold magenta]")
    console.print("[bold white]9. COMBINING MULTIPLE FEATURES[/bold white]")
    console.print("[bold magenta]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold magenta]")
    console.print()

    combined_table = Table(show_header=True, header_style="bold white on blue", title="Feature Combination Demo")
    combined_table.add_column("[bold]Feature[/bold]", width=15)
    combined_table.add_column("[bold]Example[/bold]")
    combined_table.add_column("[bold]Status[/bold]", justify="center")

    combined_table.add_row(
        "[cyan]Colors[/cyan]",
        "[red]Red[/red] [green]Green[/green] [blue]Blue[/blue]",
        "[green]✓ Working[/green]",
    )
    combined_table.add_row(
        "[cyan]Styling[/cyan]",
        "[bold]Bold[/bold] [italic]Italic[/italic] [underline]Underline[/underline]",
        "[green]✓ Working[/green]",
    )
    combined_table.add_row(
        "[cyan]Panels[/cyan]",
        "[yellow]Bordered containers[/yellow]",
        "[green]✓ Working[/green]",
    )
    combined_table.add_row(
        "[cyan]Tables[/cyan]",
        "[magenta]Structured data[/magenta]",
        "[green]✓ Working[/green]",
    )
    combined_table.add_row(
        "[cyan]Emoji[/cyan]",
        ":rocket: :star: :heart:",
        "[green]✓ Working[/green]",
    )

    console.print(combined_table)
    console.print()

    # Final message
    console.print("[bold magenta]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold magenta]")
    console.print()
    console.print("[bold green]✓ Rich test suite completed successfully![/bold green]")
    console.print("[cyan]All features are working beautifully in the terminal.[/cyan]")
    console.print()
    console.print("[dim]Original Python Rich library - for beautiful terminal formatting[/dim]")
    console.print()


if __name__ == "__main__":
    main()
