# Nested Folders

Great for studying (like biology) or collecting snippets (for programming). Say each folder is a concept. Each nested folder is a deeper concept. This tool shows those folders of information such as openable links and/or your own html code and/or document files. You can store your ratings for each folder based on how important (thermometer) and your mastery (parentheses = maybe will fail, square brackets = definitely failed, checked = recalled well).

# Adding Folders and Files

You can create nested folders. You can make mini websites and because websites usually contain folders, then you must mark the folders you want to appear on the tool with a + at the beginning of filename. See +samples folder fo an example. To reiterate, the + at the beginning of a folder will add it to the tools of collapsible nested concepts. You do not have to add a space after the +.

## +meta.json

You can create this file inside a folder that will dictate other properties of how a folder name is interpreted by the tool. You can override the folder name, instead of relying on the folder name, with the field _titleOverridden_.

You can add a short description of a folder or concept by adding a _desc_ field. This tool will display descriptions with an Info icon on the folder line that the user can move the mouse over for a tooltip popup.

There is a summary section of the tool that populates with summary when you click the Summary icon on a folder line. This summary can support html and allows you to jump to other concepts with functions such as scrollToSearch("Some Title") or scrollToUniqueId("unique....dat"). The unique id dat file is generated the first time the tool reads your folders or any new folders and allows you to jump to that specific concept by that unique folder name, in the case that your folders or concepts share similar titles so jumping to a folder by the title name is not precise enough. Use the _summary_ field which is an array entry that will concatenate into one big text in the tool. The reason for it being an array is because JSON files are not friendly with newlines and it'll make your text easier to manage inside a JSON file.

Example code of jumping to a folder or concept line:
```
<a href=\"javascript:void(0)\" onclick=\"scrollToSearch('I overridden')\">I overridden</a>"
```

The most important field is the _goto_ field which allows opening of many links when clicking the chalkboard icon at at folder or concept line. This is an array entry. Start an entry with "./" if you are opening a file inside the folder, such as "./README.md" or "./more-info.html." Like a normal server, "./" or "." is sufficient to open index.html files. You can also connect to external URLs.

## +meta.json Example

```
{
    "titleOverridden": "I overridden",
    "desc": "Description here",
    "summary": ["<b>This is <u>text</u>.</b> It is in the json file as an array of strings. ",
                "And you can jump to a text containing title ",
                "<a href=\"javascript:void(0)\" onclick=\"scrollToSearch('I overridden')\">I overridden</a>"
               ],
    "gotos": [
        ".",
        "./readme.md",
        "http://www.google.com"
    ]
}
```

# The Tool

The above section already mentioned there are info and chalkboard icons. There are other icons such as a thermometer and a multistate component to the right. Clicking these thermometer and multistate components will change their icons (aka icon states). The icons get saved so when you come back to the tool later, you will see the same icon states. 

## Thermometer
The thermometer upon clicking goes from empty to filled and you can make whatever out of it. It could mean how important the concept is to focus on.

## Multistate
To the right is possibly a blank area enclosed by left and right gray vertical bars. There are actually four slots inside these bars. Clicking a slot will cycle through blank, parentheses and square brackets. They could mean unaddressed (blank), will need to review again until commits to memory (parentheses), and will need extra reviewing because it's having problems sticking (square brackets). When you complete a concept knowing that it's committed to memory, you can SHIFT, right-click or taphold (if on a phone), to add a checkmark to any of those states. So you can have something like a parentheses with checkmark inside. This will let you know the history of how hard a concept was.

## Authors

**WENG FEI FUNG** - *Full Work* - [Siphon880gh](https://github.com/Siphon880gh)

## Contributors

**Oyedele Hammed** - *Recursion* - [devHammed](https://devhammed.github.io/)

## Recommendations

- If anyone wants to make the design more aesthetic or useable, go ahead and contribute.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

