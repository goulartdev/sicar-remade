{
  description = "Sicar Remade - Frontend";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    systems.url = "github:nix-systems/default";

    ng-lsp.url = "github:goulartdev/nixpkgs/angular-language-server";
    ng-cli.url = "github:goulartdev/nixpkgs/angular-cli";
  };

  outputs =
    {
      nixpkgs,
      systems,
      ng-lsp,
      ng-cli,
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
          angular-language-server = ng-lsp.legacyPackages.${system}.angular-language-server;
          angular-cli = ng-cli.legacyPackages.${system}.angular-cli;
        in
        {
          default = pkgs.mkShell {
            packages =
              (with pkgs; [
                gdal
                tippecanoe
                nodejs_22
                vscode-langservers-extracted
                minio
              ])
              ++ [
                angular-language-server
                angular-cli
              ];
          };
        }
      );
    };
}
