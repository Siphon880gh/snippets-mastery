# Snippets Mastery

## Nested Folders

Great for studying (like biology) or collecting snippets (for programming). Say each folder is a concept. Each nested folder is a deeper concept. This tool shows those folders of information such as openable links and/or your own html code and/or document files, as well as your own summary that lets you jump to other concepts. You can store your ratings for each folder based on how important (thermometer) and your mastery (parentheses = maybe will fail, square brackets = definitely failed, checked = recalled well).

Demo: [Try out](http://wengindustry.com/tools/snippets-mastery/)

## Adding Folders and Files

You can create nested folders. You can make mini information websites and because websites usually contain folders, then you must mark the folders you want to appear on the tool with a + at the beginning of filename. See +samples folder for an example. To reiterate, the + at the beginning of a folder will add it to the tools of collapsible nested concepts. You do not have to add a space after the +. The tool looks into the /snippets folder for these plus named folders, as well as +meta.json files contained in those folders, which we will review next.

### +meta.json

You can create this optional file inside a folder that will dictate other properties of how a folder name is interpreted by the tool. You can override the folder name, instead of relying on the folder name, with the field _titleOverridden_.

You can add a short description of a folder or concept by adding a _desc_ field. This tool will display descriptions with an Info icon on the folder line that the user can click for a tooltip popup. Hovering does not work intentionally because there may be more information in the tooltip if you choose.

A more advanced description has HTML as well so it can support hyperlink and pictures. The src and href can be relative to the snippet it is on.  Start the link with a "./" to do relative path to the snippet folder. For example:
```
"desc": "<b>Description can support HTML or plain text. Here's a picture using relative path from the current snippet:</b><center><img src='./img/placeholder.png'/></center><p>And here are links using both relative paths and absolute paths</p><ul><li><a target='_blank' href='./index.php'>Snippets index.php</a></li><li><a target='_blank' href='http://google.com/'>Google</li></ul>",
```

There is a summary section of the tool that populates with summary when you click the Summary icon on a folder line. This summary can support html and allows you to jump to other concepts with functions such as scrollToSearch("Some Title") or scrollToUniqueId("unique....dat"). The unique id dat file is generated the first time the tool reads your folders or any new folders and allows you to jump to that specific concept by that unique id, in the case that your folders or concepts share similar titles so jumping to a folder by the title name is not precise enough. Use the _summary_ field which is an array entry that will concatenate into one big text in the tool. The reason for it being an array is because JSON files are not friendly with newlines and it'll make your text easier to manage inside a JSON file.

Example code of jumping to a folder or concept line:
```
<a href=\"javascript:void(0)\" onclick=\"scrollToSearch('I overridden')\">I overridden</a>"
```

The most important field is the _gotos_ field which allows opening of many links when clicking the chalkboard icon at a folder or concept line. This is an array entry. Start an entry with "./" if you are opening a file inside the folder, such as "./README.md" or "./more-info.html." Like a normal server, "./" is sufficient to open index.html or index.php files. You can also connect to external URLs.

### +meta.json Example

```
{
    "titleOverridden": "I overridden",
    "desc": "HTML or text description here",
    "summary": ["<b>This is <u>text</u>.</b> It is in the json file as an array of strings that will be will separated as <br> lines when rendered. ",
                "And you can jump to a text containing title ",
                "<a href=\"javascript:void(0)\" onclick=\"scrollToSearch('I overridden')\">I overridden</a>"
               ],
    "summaryFile": "./test.txt",
    "gotos": [
        ".",
        "./readme.md",
        "http://www.google.com"
    ]
}
```

### +saveid#####.dat

These files are generated when you run the Snippets Mastery. When you click the thermometer or the multistate, this information gets saved to that part of the tree for future sessions. However, the title can be changed at anytime by changing the + folder name or the `titleOverridden` field in `+meta.json`, so Snippets Mastery automatically generate Ids and associate them to those thermometer or multistate information.

## Referring to other concepts

You can jump to different concepts from a summary.
```
"<a href=\"javascript:void(0)\" onclick=\"scrollToSearch('I overridden')\">I overridden</a>"
```

## Summary formats

Summary can be typed as an array of strings like the above example in +meta.json. However, it can simply be a string. Or you can have the summary read from a file. If you provide both the array/string and the file path, then it will read the array/string then the file contents.
```
"summary": "one line doesn't require an array"
```


# The Tool

The above section already mentioned there are info and chalkboard icons. There are other icons such as a thermometer and a multistate component to the right. Clicking these thermometer and multistate components will change their icons (aka icon states). The icons get saved so when you come back to the tool later, you will see the same icon states. 

## Thermometer
The thermometer upon clicking goes from empty, to partially filled, to completely filled, and you can make it to mean whatever you want. It could mean how important the concept is to focus on.

## Multistate
To the right is possibly a blank area enclosed by left and right gray vertical bars. There are actually four slots inside these bars. Clicking a slot will cycle through blank, parentheses and square brackets. They could mean unaddressed (blank), will need to review again until commits to memory (parentheses), and will need extra reviewing because it's having problems sticking (square brackets). When you complete a concept knowing that it's committed to memory, you can SHIFT+click, right-click or taphold (if on a phone), to add a checkmark to any of those states. So you can have something like a parentheses with checkmark inside. This will let you know the history of how hard a concept was.

# Deployment
Runs out of the box on servers supporting PHP 5 or PHP 7.

# Credit

## Authors

**WENG FEI FUNG** - *Full Work* - [Siphon880gh](https://github.com/Siphon880gh)

## Contributors

**Oyedele Hammed** - *Recursion* - [devHammed](https://devhammed.github.io/)

# Recommendations

- If anyone wants to make the design more aesthetic or useable, go ahead and contribute.

# License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

