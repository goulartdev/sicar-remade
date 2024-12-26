{
  description = "Sicar Remade - Frontend";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    systems.url = "github:nix-systems/default";
    tippecanoe.url = "github:NixOS/nixpkgs/d8f342297254713a66cb0fa464ee86e3942e92ac";
  };

  outputs =
    {
      nixpkgs,
      systems,
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
                angular-language-server
                minio
                duckdb
                python313
                pipenv
                fastapi-cli
              ])
              ++ [
                tippecanoe.legacyPackages.${system}.tippecanoe
              ];

            LD_LIBRARY_PATH = nixpkgs.lib.makeLibraryPath [ pkgs.stdenv.cc.cc.lib ];
          };
        }
      );
    };
}
