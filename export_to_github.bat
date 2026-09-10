@echo off
rem Export script for Windows: Safely copies Learn Better Web Hub into your local repo
rem Usage: export_to_github.bat C:\path\to\learn-better

if "%~1"=="" (
    echo Usage: export_to_github.bat C:\path\to\learn-better
    exit /b 1
)

set TARGET_REPO=%~1

if not exist "%TARGET_REPO%\.git" (
    echo Error: %TARGET_REPO% does not appear to be a git repository.
    exit /b 1
)

echo ==> Switching to feature branch in %TARGET_REPO%...
pushd "%TARGET_REPO%"
git checkout -b feature/gemini-knowledge-hub 2>nul || git checkout feature/gemini-knowledge-hub
popd

echo ==> Creating webapp folder...
if not exist "%TARGET_REPO%\webapp" mkdir "%TARGET_REPO%\webapp"

echo ==> Copying web application files...
xcopy /E /I /Y src "%TARGET_REPO%\webapp\src"
if exist public xcopy /E /I /Y public "%TARGET_REPO%\webapp\public"
copy /Y package.json "%TARGET_REPO%\webapp\"
copy /Y tsconfig.json "%TARGET_REPO%\webapp\"
copy /Y vite.config.ts "%TARGET_REPO%\webapp\"
copy /Y index.html "%TARGET_REPO%\webapp\"
copy /Y server.ts "%TARGET_REPO%\webapp\"

echo ==> Copying audit logs...
copy /Y gemini_prompts.md "%TARGET_REPO%\"
copy /Y gemini_feedback.md "%TARGET_REPO%\"

echo ==> Verifying status...
pushd "%TARGET_REPO%"
git status
popd

echo --------------------------------------------------------
echo Done! All existing python tools in code/ and lib/ are intact.
echo You can commit safely with:
echo   git add webapp/ gemini_prompts.md gemini_feedback.md
echo   git commit -m "feat: add Learn Better Knowledge Hub and AI vibe coding guide"
echo   git push -u origin feature/gemini-knowledge-hub
echo --------------------------------------------------------
