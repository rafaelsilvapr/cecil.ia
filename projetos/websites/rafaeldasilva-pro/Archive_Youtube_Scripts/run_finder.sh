#!/bin/bash
osascript -e 'tell application "Finder" to make new folder at POSIX file "/Users/rafaelrodriguesdasilva/Documents/Agentes - Antigravity/Prof. Rafael/" with properties {name:"Bkp_Fase1_Antigos"}' 2>/dev/null
osascript -e 'tell application "Finder" to move (every file of folder POSIX file "/Users/rafaelrodriguesdasilva/Documents/Agentes - Antigravity/Prof. Rafael/" whose name ends with ".xlsx" and name contains "Relatorio") to folder POSIX file "/Users/rafaelrodriguesdasilva/Documents/Agentes - Antigravity/Prof. Rafael/Bkp_Fase1_Antigos/" with replacing' 2>/dev/null
