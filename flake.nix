{
  description = "Sicar Remade - Frontend";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    systems.url = "github:nix-systems/default";

    ng-lsp.url = "github:goulartdev/nixpkgs/angular-language-server";
    ng-cli.url = "github:goulartdev/nixpkgs/angular-cli";
    tippecanoe.url = "github:NixOS/nixpkgs/d8f342297254713a66cb0fa464ee86e3942e92ac";
  };

  outputs =
    {
      nixpkgs,
      systems,
      ng-lsp,
      ng-cli,
      tippecanoe,
      ...
    }:
    let
      forEachSystem = nixpkgs.lib.genAttrs (import systems);
    in
    {
      devShells = forEachSystem (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in
        {
          default = pkgs.mkShell {
            packages =
              (with pkgs; [
                gdal
                nodejs_22
                vscode-langservers-extracted
                minio
              ])
              ++ [
                ng-lsp.legacyPackages.${system}.angular-language-server
                ng-cli.legacyPackages.${system}.angular-cli
                tippecanoe.legacyPackages.${system}.tippecanoe
              ];
          };
        }
      );
    };
}
