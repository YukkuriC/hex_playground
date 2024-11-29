import os, subprocess, sys


def linkFolder(link: str, src: str):
    print(link, src)
    if not os.path.isdir(src) or os.path.isdir(link):
        return
    os.makedirs(os.path.dirname(link), exist_ok=True)
    subprocess.run(
        [
            'cmd', '/c', 'mklink', '/J',
            os.path.abspath(link),
            os.path.abspath(src)
        ],
        shell=True,
    )


SRC_ROOT = os.path.dirname(__file__)
SRC_TARGETS = ['server_scripts', 'startup_scripts', 'client_scripts']
SRC_TARGETS_SEP = ['assets/hex_playground', 'data/hex_playground']
CUSTOM_LINKS = [
    # hex patchouli
    [
        # TODO need testing
        # '../patchouli_books/thehexbook',
        # 'data/hexcasting/patchouli_books/thehexbook'
    ]
]
TYPE_TARGETS = ['probe']
MC_ROOT = r'C:/Minecraft/.minecraft/versions'
BASE_DIR = sys.argv[1] if len(sys.argv) > 1 else 'Hex'
LINK_NAME = 'HEX'

for sub in ['Hex']:
    kjsPath = os.path.join(MC_ROOT, sub, 'kubejs')
    if not os.path.isdir(kjsPath):
        continue
    if sub == BASE_DIR:
        for t in TYPE_TARGETS:
            linkFolder(
                os.path.join(SRC_ROOT, t),
                os.path.join(kjsPath, t),
            )
    for t in SRC_TARGETS:
        linkFolder(
            os.path.join(kjsPath, t, LINK_NAME),
            os.path.join(SRC_ROOT, t),
        )
    for t in SRC_TARGETS_SEP:
        linkFolder(
            os.path.join(kjsPath, t),
            os.path.join(SRC_ROOT, t),
        )
    for [f, t] in CUSTOM_LINKS:
        linkFolder(
            os.path.join(kjsPath, f),
            os.path.join(SRC_ROOT, t),
        )
