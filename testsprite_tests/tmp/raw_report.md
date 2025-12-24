
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** nextn
- **Date:** 2025-11-01
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001
- **Test Name:** user authentication signup login logout
- **Test Code:** [TC001_user_authentication_signup_login_logout.py](./TC001_user_authentication_signup_login_logout.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 57, in <module>
  File "<string>", line 24, in test_user_authentication_signup_login_logout
AssertionError: Signup failed with status code 400

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/81fbfd96-2845-4a95-bf4f-457a5b6f8c4c/f3056cff-16f1-4e6b-a3aa-fad456b76fb6
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002
- **Test Name:** project management create open rename delete
- **Test Code:** [TC002_project_management_create_open_rename_delete.py](./TC002_project_management_create_open_rename_delete.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 88, in <module>
  File "<string>", line 50, in test_project_management_create_open_rename_delete
AssertionError: Project creation failed: {"error":"User ID and project name are required"}

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/81fbfd96-2845-4a95-bf4f-457a5b6f8c4c/98cdb2e2-3c41-4e1d-9944-1c8ec79c1d60
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003
- **Test Name:** python code execution sandbox
- **Test Code:** [TC003_python_code_execution_sandbox.py](./TC003_python_code_execution_sandbox.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 100, in <module>
  File "<string>", line 37, in test_python_code_execution_sandbox
AssertionError: Expected 200 OK, got 401, response: {"error":"Authentication required. Please provide a valid token."}

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/81fbfd96-2845-4a95-bf4f-457a5b6f8c4c/8266d07e-7e9a-45b9-8637-ee29f4b6e5ef
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004
- **Test Name:** ai code assistant chat interface
- **Test Code:** [TC004_ai_code_assistant_chat_interface.py](./TC004_ai_code_assistant_chat_interface.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 71, in <module>
  File "<string>", line 58, in test_ai_code_assistant_chat_interface
AssertionError: AI assist request failed for action explain: {"error":"Instruction is required"}

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/81fbfd96-2845-4a95-bf4f-457a5b6f8c4c/0ec7754a-4623-44de-828c-adc764cc34e1
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005
- **Test Name:** csv excel file upload and ai data analysis
- **Test Code:** [TC005_csv_excel_file_upload_and_ai_data_analysis.py](./TC005_csv_excel_file_upload_and_ai_data_analysis.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 193, in <module>
  File "<string>", line 53, in test_csv_excel_file_upload_and_ai_data_analysis
AssertionError: Project creation failed: <!DOCTYPE html><html lang="en"><head><meta charSet="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><link rel="stylesheet" href="/_next/static/chunks/src_app_globals_b805903d.css" data-precedence="next_static/chunks/src_app_globals_b805903d.css"/><link rel="preload" as="script" fetchPriority="low" href="/_next/static/chunks/%5Bturbopack%5D_browser_dev_hmr-client_hmr-client_ts_fd44f5a4._.js"/><script src="/_next/static/chunks/node_modules_next_dist_compiled_2ce9398a._.js" async=""></script><script src="/_next/static/chunks/node_modules_next_dist_client_8f19e6fb._.js" async=""></script><script src="/_next/static/chunks/node_modules_next_dist_2ecbf5fa._.js" async=""></script><script src="/_next/static/chunks/node_modules_%40swc_helpers_cjs_00636ac3._.js" async=""></script><script src="/_next/static/chunks/_e69f0d32._.js" async=""></script><script src="/_next/static/chunks/_93808211._.js" async=""></script><script src="/_next/static/chunks/node_modules_next_dist_1a6ee436._.js" async=""></script><script src="/_next/static/chunks/src_app_favicon_ico_mjs_8a7a8fdc._.js" async=""></script><script src="/_next/static/chunks/node_modules_abf16372._.js" async=""></script><script src="/_next/static/chunks/src_50730ecd._.js" async=""></script><script src="/_next/static/chunks/src_app_layout_tsx_c0237562._.js" async=""></script><meta name="robots" content="noindex"/><title>404: This page could not be found.</title><link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous"/><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&amp;family=Source+Code+Pro:wght@400;500;600&amp;display=swap" rel="stylesheet"/><title>PyCode AI</title><meta name="description" content="Code Python Anywhere, Anytime with AI"/><link rel="icon" href="/favicon.ico?favicon.a7a13c43.ico" sizes="32x32" type="image/x-icon"/><script>document.querySelectorAll('body link[rel="icon"], body link[rel="apple-touch-icon"]').forEach(el => document.head.appendChild(el))</script><script src="/_next/static/chunks/node_modules_next_dist_build_polyfills_polyfill-nomodule.js" noModule=""></script></head><body class="min-h-screen bg-background font-body antialiased"><script>!function(){try{var d=document.documentElement,c=d.classList;c.remove('light','dark');var e=localStorage.getItem('theme');if('system'===e||(!e&&true)){var t='(prefers-color-scheme: dark)',m=window.matchMedia(t);if(m.media!==t||m.matches){d.style.colorScheme = 'dark';c.add('dark')}else{d.style.colorScheme = 'light';c.add('light')}}else if(e){c.add(e|| '')}if(e==='light'||e==='dark')d.style.colorScheme=e}catch(e){}}()</script><div style="font-family:system-ui,&quot;Segoe UI&quot;,Roboto,Helvetica,Arial,sans-serif,&quot;Apple Color Emoji&quot;,&quot;Segoe UI Emoji&quot;;height:100vh;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center"><div><style>body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}</style><h1 class="next-error-h1" style="display:inline-block;margin:0 20px 0 0;padding:0 23px 0 0;font-size:24px;font-weight:500;vertical-align:top;line-height:49px">404</h1><div style="display:inline-block"><h2 style="font-size:14px;font-weight:400;line-height:49px;margin:0">This page could not be found.</h2></div></div></div><!--$--><!--/$--><!--$--><!--/$--><div role="region" aria-label="Notifications (F8)" tabindex="-1" style="pointer-events:none"><ol tabindex="-1" class="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]"></ol></div><script src="/_next/static/chunks/%5Bturbopack%5D_browser_dev_hmr-client_hmr-client_ts_fd44f5a4._.js" async=""></script><script>(self.__next_f=self.__next_f||[]).push([0])</script><script>self.__next_f.push([1,"3:\"$Sreact.fragment\"\n5:I[\"[project]/node_modules/next/dist/client/components/layout-router.js [app-client] (ecmascript)\",[\"/_next/static/chunks/node_modules_next_dist_1a6ee436._.js\",\"/_next/static/chunks/src_app_favicon_ico_mjs_8a7a8fdc._.js\"],\"default\"]\n6:I[\"[project]/node_modules/next/dist/client/components/render-from-template-context.js [app-client] (ecmascript)\",[\"/_next/static/chunks/node_modules_next_dist_1a6ee436._.js\",\"/_next/static/chunks/src_app_favicon_ico_mjs_8a7a8fdc._.js\"],\"default\"]\n8:I[\"[project]/src/components/providers/theme-provider.tsx [app-client] (ecmascript)\",[\"/_next/static/chunks/node_modules_abf16372._.js\",\"/_next/static/chunks/src_50730ecd._.js\",\"/_next/static/chunks/src_app_layout_tsx_c0237562._.js\"],\"ThemeProvider\"]\nc:I[\"[project]/src/components/ui/toaster.tsx [app-client] (ecmascript)\",[\"/_next/static/chunks/node_modules_abf16372._.js\",\"/_next/static/chunks/src_50730ecd._.js\",\"/_next/static/chunks/src_app_layout_tsx_c0237562._.js\"],\"Toaster\"]\n13:I[\"[project]/node_modules/next/dist/client/components/metadata/metadata-boundary.js [app-client] (ecmascript)\",[\"/_next/static/chunks/node_modules_next_dist_1a6ee436._.js\",\"/_next/static/chunks/src_app_favicon_ico_mjs_8a7a8fdc._.js\"],\"MetadataBoundary\"]\n16:I[\"[project]/node_modules/next/dist/client/components/metadata/metadata-boundary.js [app-client] (ecmascript)\",[\"/_next/static/chunks/node_modules_next_dist_1a6ee436._.js\",\"/_next/static/chunks/src_app_favicon_ico_mjs_8a7a8fdc._.js\"],\"OutletBoundary\"]\n1d:I[\"[project]/node_modules/next/dist/client/components/metadata/async-metadata.js [app-client] (ecmascript)\",[\"/_next/static/chunks/node_modules_next_dist_1a6ee436._.js\",\"/_next/static/chunks/src_app_favicon_ico_mjs_8a7a8fdc._.js\"],\"AsyncMetadataOutlet\"]\n23:I[\"[project]/node_modules/next/dist/client/components/metadata/metadata-boundary.js [app-client] (ecmascript)\",[\"/_next/static/chunks/node_modules_next_dist_1a6ee436._.js\",\"/_next/static/chunks/src_app_favicon_ico_mjs_8a7a8fdc._.js\"],\"ViewportBoundary\"]\n29:I[\"[project]/node_modules/next/"])</script><script>self.__next_f.push([1,"dist/client/components/error-boundary.js [app-client] (ecmascript)\",[\"/_next/static/chunks/node_modules_next_dist_1a6ee436._.js\",\"/_next/static/chunks/src_app_favicon_ico_mjs_8a7a8fdc._.js\"],\"default\"]\n2a:\"$Sreact.suspense\"\n2b:I[\"[project]/node_modules/next/dist/client/components/metadata/async-metadata.js [app-client] (ecmascript)\",[\"/_next/static/chunks/node_modules_next_dist_1a6ee436._.js\",\"/_next/static/chunks/src_app_favicon_ico_mjs_8a7a8fdc._.js\"],\"AsyncMetadata\"]\n:HL[\"/_next/static/chunks/src_app_globals_b805903d.css\",\"style\"]\n2:{\"name\":\"Preloads\",\"env\":\"Server\",\"key\":null,\"owner\":null,\"stack\":[],\"props\":{\"preloadCallbacks\":[\"$E(()=\u003e{ctx.componentMod.preloadStyle(fullHref,ctx.renderOpts.crossOrigin,ctx.nonce)})\"]}}\n1:D\"$2\"\n1:null\n7:{\"name\":\"RootLayout\",\"env\":\"Server\",\"key\":null,\"owner\":null,\"stack\":[],\"props\":{\"children\":[\"$\",\"$L5\",null,{\"parallelRouterKey\":\"children\",\"error\":\"$undefined\",\"errorStyles\":\"$undefined\",\"errorScripts\":\"$undefined\",\"template\":[\"$\",\"$3\",null,{\"children\":[\"$\",\"$L6\",null,{},null,[],1]},null,[],0],\"templateStyles\":\"$undefined\",\"templateScripts\":\"$undefined\",\"notFound\":\"$Y\",\"forbidden\":\"$undefined\",\"unauthorized\":\"$undefined\"},null,[],1],\"params\":\"$Y\"}}\n4:D\"$7\"\na:{\"name\":\"NotFound\",\"env\":\"Server\",\"key\":null,\"owner\":null,\"stack\":[],\"props\":{}}\n9:D\"$a\"\nb:{\"name\":\"HTTPAccessErrorFallback\",\"env\":\"Server\",\"key\":null,\"owner\":\"$a\",\"stack\":[],\"props\":{\"status\":404,\"message\":\"This page could not be found.\"}}\n9:D\"$b\"\n9:[[\"$\",\"title\",null,{\"children\":\"404: This page could not be found.\"},\"$b\",[],1],[\"$\",\"div\",null,{\"style\":{\"fontFamily\":\"system-ui,\\\"Segoe UI\\\",Roboto,Helvetica,Arial,sans-serif,\\\"Apple Color Emoji\\\",\\\"Segoe UI Emoji\\\"\",\"height\":\"100vh\",\"textAlign\":\"center\",\"display\":\"flex\",\"flexDirection\":\"column\",\"alignItems\":\"center\",\"justifyContent\":\"center\"},\"children\":[\"$\",\"div\",null,{\"children\":[[\"$\",\"style\",null,{\"dangerouslySetInnerHTML\":{\"__html\":\"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#"])</script><script>self.__next_f.push([1,"fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}\"}},\"$b\",[],1],[\"$\",\"h1\",null,{\"className\":\"next-error-h1\",\"style\":{\"display\":\"inline-block\",\"margin\":\"0 20px 0 0\",\"padding\":\"0 23px 0 0\",\"fontSize\":24,\"fontWeight\":500,\"verticalAlign\":\"top\",\"lineHeight\":\"49px\"},\"children\":404},\"$b\",[],1],[\"$\",\"div\",null,{\"style\":{\"display\":\"inline-block\"},\"children\":[\"$\",\"h2\",null,{\"style\":{\"fontSize\":14,\"fontWeight\":400,\"lineHeight\":\"49px\",\"margin\":0},\"children\":\"This page could not be found.\"},\"$b\",[],1]},\"$b\",[],1]]},\"$b\",[],1]},\"$b\",[],1]]\n4:[\"$\",\"html\",null,{\"lang\":\"en\",\"suppressHydrationWarning\":true,\"children\":[[\"$\",\"head\",null,{\"children\":[[\"$\",\"link\",null,{\"rel\":\"preconnect\",\"href\":\"https://fonts.googleapis.com\"},\"$7\",[[\"RootLayout\",\"C:\\\\Users\\\\Atharv\\\\Downloads\\\\pyapp\\\\.next\\\\server\\\\chunks\\\\ssr\\\\_927648cb._.js\",124,272]],1],[\"$\",\"link\",null,{\"rel\":\"preconnect\",\"href\":\"https://fonts.gstatic.com\",\"crossOrigin\":\"anonymous\"},\"$7\",[[\"RootLayout\",\"C:\\\\Users\\\\Atharv\\\\Downloads\\\\pyapp\\\\.next\\\\server\\\\chunks\\\\ssr\\\\_927648cb._.js\",132,272]],1],[\"$\",\"link\",null,{\"href\":\"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800\u0026family=Source+Code+Pro:wght@400;500;600\u0026display=swap\",\"rel\":\"stylesheet\"},\"$7\",[[\"RootLayout\",\"C:\\\\Users\\\\Atharv\\\\Downloads\\\\pyapp\\\\.next\\\\server\\\\chunks\\\\ssr\\\\_927648cb._.js\",141,272]],1]]},\"$7\",[[\"RootLayout\",\"C:\\\\Users\\\\Atharv\\\\Downloads\\\\pyapp\\\\.next\\\\server\\\\chunks\\\\ssr\\\\_927648cb._.js\",122,264]],1],[\"$\",\"body\",null,{\"className\":\"min-h-screen bg-background font-body antialiased\",\"children\":[\"$\",\"$L8\",null,{\"attribute\":\"class\",\"defaultTheme\":\"system\",\"enableSystem\":true,\"disableTransitionOnChange\":true,\"children\":[[\"$\",\"$L5\",null,{\"parallelRouterKey\":\"children\",\"error\":\"$undefined\",\"errorStyles\":\"$undefined\",\"errorScripts\":\"$undefined\",\"template\":[\"$\",\"$L6\",null,{},null,[],1],\"templateStyles\":\"$undefined\",\"templateScripts\":\"$undefined\",\"notFound\":[\"$9\",[]],\"forbidden\":\"$undefined\",\"unauthorized\":\"$undefined\"},null,[],1],[\"$\",\"$Lc\",null,{},\"$7\",[[\"RootLayout\",\""])</script><script>self.__next_f.push([1,"C:\\\\Users\\\\Atharv\\\\Downloads\\\\pyapp\\\\.next\\\\server\\\\chunks\\\\ssr\\\\_927648cb._.js\",164,276]],1]]},\"$7\",[[\"RootLayout\",\"C:\\\\Users\\\\Atharv\\\\Downloads\\\\pyapp\\\\.next\\\\server\\\\chunks\\\\ssr\\\\_927648cb._.js\",157,278]],1]},\"$7\",[[\"RootLayout\",\"C:\\\\Users\\\\Atharv\\\\Downloads\\\\pyapp\\\\.next\\\\server\\\\chunks\\\\ssr\\\\_927648cb._.js\",155,264]],1]]},\"$7\",[[\"RootLayout\",\"C:\\\\Users\\\\Atharv\\\\Downloads\\\\pyapp\\\\.next\\\\server\\\\chunks\\\\ssr\\\\_927648cb._.js\",118,263]],1]\ne:{\"name\":\"NotFound\",\"env\":\"Server\",\"key\":null,\"owner\":null,\"stack\":[],\"props\":{\"params\":\"$@\",\"searchParams\":\"$@\"}}\nd:D\"$e\"\nf:{\"name\":\"HTTPAccessErrorFallback\",\"env\":\"Server\",\"key\":null,\"owner\":\"$e\",\"stack\":[],\"props\":{\"status\":404,\"message\":\"This page could not be found.\"}}\nd:D\"$f\"\nd:[[\"$\",\"title\",null,{\"children\":\"404: This page could not be found.\"},\"$f\",[],1],[\"$\",\"div\",null,{\"style\":\"$9:1:props:style\",\"children\":[\"$\",\"div\",null,{\"children\":[[\"$\",\"style\",null,{\"dangerouslySetInnerHTML\":{\"__html\":\"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}\"}},\"$f\",[],1],[\"$\",\"h1\",null,{\"className\":\"next-error-h1\",\"style\":\"$9:1:props:children:props:children:1:props:style\",\"children\":404},\"$f\",[],1],[\"$\",\"div\",null,{\"style\":\"$9:1:props:children:props:children:2:props:style\",\"children\":[\"$\",\"h2\",null,{\"style\":\"$9:1:props:children:props:children:2:props:children:props:style\",\"children\":\"This page could not be found.\"},\"$f\",[],1]},\"$f\",[],1]]},\"$f\",[],1]},\"$f\",[],1]]\n11:{\"name\":\"\",\"env\":\"Server\",\"key\":null,\"owner\":null,\"stack\":[],\"props\":{}}\n10:D\"$11\"\n12:{\"name\":\"MetadataTree\",\"env\":\"Server\",\"key\":null,\"owner\":null,\"stack\":[],\"props\":{}}\n10:D\"$12\"\n15:{\"name\":\"__next_metadata_boundary__\",\"env\":\"Server\",\"key\":null,\"owner\":\"$12\",\"stack\":[],\"props\":{}}\n14:D\"$15\"\n10:[\"$\",\"$L13\",null,{\"children\":\"$L14\"},\"$12\",[],1]\n18:{\"name\":\"__next_outlet_boundary__\",\"env\":\"Server\",\"key\":null,\"owner\":null,\"stack\":[],\"props\":{\"ready\":\"$E(asyn"])</script><script>self.__next_f.push([1,"c function getViewportReady() {\\n        await viewport();\\n        return undefined;\\n    })\"}}\n17:D\"$18\"\n1a:{\"name\":\"__next_outlet_boundary__\",\"env\":\"Server\",\"key\":null,\"owner\":null,\"stack\":[],\"props\":{\"ready\":\"$E(async function getMetadataReady() {\\n        // Only warm up metadata() call when it's blocking metadata,\\n        // otherwise it will be fully managed by AsyncMetadata component.\\n        if (!serveStreamingMetadata) {\\n            await metadata();\\n        }\\n        return undefined;\\n    })\"}}\n19:D\"$1a\"\n1c:{\"name\":\"StreamingMetadataOutlet\",\"env\":\"Server\",\"key\":null,\"owner\":null,\"stack\":[],\"props\":{}}\n1b:D\"$1c\"\n1b:[\"$\",\"$L1d\",null,{\"promise\":\"$@1e\"},\"$1c\",[],1]\n20:{\"name\":\"NonIndex\",\"env\":\"Server\",\"key\":null,\"owner\":null,\"stack\":[],\"props\":{\"pagePath\":\"/404\",\"statusCode\":404,\"isPossibleServerAction\":false}}\n1f:D\"$20\"\n1f:[\"$\",\"meta\",null,{\"name\":\"robots\",\"content\":\"noindex\"},null,[],1]\n22:{\"name\":\"ViewportTree\",\"env\":\"Server\",\"key\":\"IlqefyN1ti7Nh_xIf53MD\",\"owner\":null,\"stack\":[],\"props\":{}}\n21:D\"$22\"\n25:{\"name\":\"__next_viewport_boundary__\",\"env\":\"Server\",\"key\":null,\"owner\":\"$22\",\"stack\":[],\"props\":{}}\n24:D\"$25\"\n21:[\"$\",\"$3\",\"IlqefyN1ti7Nh_xIf53MD\",{\"children\":[[\"$\",\"$L23\",null,{\"children\":\"$L24\"},\"$22\",[],1],null]},null,null,0]\n27:{\"name\":\"\",\"env\":\"Server\",\"key\":null,\"owner\":null,\"stack\":[],\"props\":{}}\n26:D\"$27\"\n26:null\n28:[]\n0:{\"P\":\"$1\",\"b\":\"development\",\"p\":\"\",\"c\":[\"\",\"api\",\"projects\",\"route\"],\"i\":false,\"f\":[[[\"\",{\"children\":[\"/_not-found\",{\"children\":[\"__PAGE__\",{}]}]},\"$undefined\",\"$undefined\",true],[\"\",[\"$\",\"$3\",\"c\",{\"children\":[[[\"$\",\"link\",\"0\",{\"rel\":\"stylesheet\",\"href\":\"/_next/static/chunks/src_app_globals_b805903d.css\",\"precedence\":\"next_static/chunks/src_app_globals_b805903d.css\",\"crossOrigin\":\"$undefined\",\"nonce\":\"$undefined\"},null,[],0],[\"$\",\"script\",\"script-0\",{\"src\":\"/_next/static/chunks/node_modules_abf16372._.js\",\"async\":true,\"nonce\":\"$undefined\"},null,[],0],[\"$\",\"script\",\"script-1\",{\"src\":\"/_next/static/chunks/src_50730ecd._.js\",\"async\":true,\"nonce\":\"$undefined\"},null,[],0],[\"$\",\""])</script><script>self.__next_f.push([1,"script\",\"script-2\",{\"src\":\"/_next/static/chunks/src_app_layout_tsx_c0237562._.js\",\"async\":true,\"nonce\":\"$undefined\"},null,[],0]],\"$4\"]},null,[],0],{\"children\":[\"/_not-found\",[\"$\",\"$3\",\"c\",{\"children\":[null,[\"$\",\"$L5\",null,{\"parallelRouterKey\":\"children\",\"error\":\"$undefined\",\"errorStyles\":\"$undefined\",\"errorScripts\":\"$undefined\",\"template\":[\"$\",\"$L6\",null,{},null,[],1],\"templateStyles\":\"$undefined\",\"templateScripts\":\"$undefined\",\"notFound\":\"$undefined\",\"forbidden\":\"$undefined\",\"unauthorized\":\"$undefined\"},null,[],1]]},null,[],0],{\"children\":[\"__PAGE__\",[\"$\",\"$3\",\"c\",{\"children\":[\"$d\",\"$10\",null,[\"$\",\"$L16\",null,{\"children\":[\"$L17\",\"$L19\",\"$1b\"]},null,[],1]]},null,[],0],{},null,false]},null,false]},null,false],[\"$\",\"$3\",\"h\",{\"children\":[\"$1f\",\"$21\",\"$26\"]},null,[],0],false]],\"m\":\"$W28\",\"G\":[\"$29\",\"$undefined\"],\"s\":false,\"S\":false}\n14:[\"$\",\"$2a\",null,{\"fallback\":null,\"children\":[\"$\",\"$L2b\",null,{\"promise\":\"$@2c\"},\"$15\",[],1]},\"$15\",[],1]\n19:null\n24:[[\"$\",\"meta\",\"0\",{\"charSet\":\"utf-8\"},\"$18\",[],0],[\"$\",\"meta\",\"1\",{\"name\":\"viewport\",\"content\":\"width=device-width, initial-scale=1\"},\"$18\",[],0]]\n17:null\n"])</script><script>self.__next_f.push([1,"2c:{\"metadata\":[[\"$\",\"title\",\"0\",{\"children\":\"PyCode AI\"},\"$15\",[],0],[\"$\",\"meta\",\"1\",{\"name\":\"description\",\"content\":\"Code Python Anywhere, Anytime with AI\"},\"$15\",[],0],[\"$\",\"link\",\"2\",{\"rel\":\"icon\",\"href\":\"/favicon.ico?favicon.a7a13c43.ico\",\"sizes\":\"32x32\",\"type\":\"image/x-icon\"},\"$15\",[],0]],\"error\":null,\"digest\":\"$undefined\"}\n1e:{\"metadata\":\"$2c:metadata\",\"error\":null,\"digest\":\"$undefined\"}\n"])</script></body></html>

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/81fbfd96-2845-4a95-bf4f-457a5b6f8c4c/93514ff1-da9f-4901-9b59-4192ab6519fb
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006
- **Test Name:** file management create rename delete
- **Test Code:** [TC006_file_management_create_rename_delete.py](./TC006_file_management_create_rename_delete.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 151, in <module>
  File "<string>", line 28, in test_file_management_create_rename_delete
AssertionError: Login failed: {"error":"Email and password are required"}

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/81fbfd96-2845-4a95-bf4f-457a5b6f8c4c/7a6c4136-0c6c-449d-8bfe-b827eb145521
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007
- **Test Name:** terminal shell command execution
- **Test Code:** [TC007_terminal_shell_command_execution.py](./TC007_terminal_shell_command_execution.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 75, in <module>
  File "<string>", line 18, in test_terminal_shell_command_execution
AssertionError: Signup failed: {"error":"User with this email already exists"}

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/81fbfd96-2845-4a95-bf4f-457a5b6f8c4c/c00c854d-5d9c-4cc1-a53f-5b0a7cd095d1
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008
- **Test Name:** file upload drag and drop validation
- **Test Code:** [TC008_file_upload_drag_and_drop_validation.py](./TC008_file_upload_drag_and_drop_validation.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 132, in <module>
  File "<string>", line 22, in test_file_upload_drag_and_drop_validation
AssertionError: Signup failed: {"error":"User with this email already exists"}

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/81fbfd96-2845-4a95-bf4f-457a5b6f8c4c/d354ee0c-09c6-41c0-b479-067d7f6808c9
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009
- **Test Name:** dashboard project list and statistics
- **Test Code:** [TC009_dashboard_project_list_and_statistics.py](./TC009_dashboard_project_list_and_statistics.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 92, in <module>
  File "<string>", line 48, in test_dashboard_project_list_and_statistics
AssertionError: Project creation failed: {"error":"User ID and project name are required"}

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/81fbfd96-2845-4a95-bf4f-457a5b6f8c4c/f3bb8342-eb4d-435b-a8b0-62a23a9fc5ff
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010
- **Test Name:** admin panel user and system management
- **Test Code:** [TC010_admin_panel_user_and_system_management.py](./TC010_admin_panel_user_and_system_management.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 81, in <module>
  File "<string>", line 16, in test_admin_panel_user_and_system_management
AssertionError: Signup failed: {"error":"User with this email already exists"}

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/81fbfd96-2845-4a95-bf4f-457a5b6f8c4c/26d5ad8c-496b-4066-9dd6-1dac1d12bcaa
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **0.00** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---