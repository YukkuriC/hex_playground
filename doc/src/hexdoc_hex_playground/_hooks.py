from importlib.resources import Package
from typing_extensions import override

from hexdoc.plugin import (
    HookReturn,
    ModPlugin,
    ModPluginImpl,
    ModPluginWithBook,
    hookimpl,
)

import hexdoc_hex_playground

from .__gradle_version__ import FULL_VERSION, GRADLE_VERSION
from .__version__ import PY_VERSION


class HexPlaygroundPlugin(ModPluginImpl):
    @staticmethod
    @hookimpl
    def hexdoc_mod_plugin(branch: str, props) -> ModPlugin:
        if props.modid=='yc':
            HexPlaygroundPlugin.do_patch()
        return HexPlaygroundModPlugin(branch=branch)
    
    @staticmethod
    def do_patch():
        from hexdoc_hexcasting.metadata import HexContext
        def force_old_pattern(self:HexContext, signatures, loader):
            return self._add_patterns_0_10(signatures, loader.props)
        HexContext._add_patterns_0_11=force_old_pattern


class HexPlaygroundModPlugin(ModPluginWithBook):
    @property
    @override
    def modid(self) -> str:
        return "yc"

    @property
    @override
    def full_version(self) -> str:
        return FULL_VERSION

    @property
    @override
    def mod_version(self) -> str:
        return GRADLE_VERSION

    @property
    @override
    def plugin_version(self) -> str:
        return PY_VERSION

    @override
    def resource_dirs(self) -> HookReturn[Package]:
        # lazy import because generated may not exist when this file is loaded
        # eg. when generating the contents of generated
        # so we only want to import it if we actually need it
        from ._export import generated

        return generated
    
    @override
    def jinja_template_root(self) -> tuple[Package, str]:
        return hexdoc_hex_playground, "_templates"
