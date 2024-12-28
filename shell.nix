{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    nodejs 
    nodePackages.pnpm
  ];

  shellHook = ''
    export PATH=$PATH:${pkgs.nodePackages.pnpm}/bin
  '';
}
