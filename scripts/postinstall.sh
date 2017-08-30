echo "Copy required resources to public folder"

rm -Rf public/extlib/*

cp -Rf node_modules/font-awesome public/lib/font-awesome
cp -Rf  node_modules/bootstrap public/lib/bootstrap
cp -Rf  node_modules/bootstrap-treeview/dist public/lib/bootstrap-treeview
cp -Rf  node_modules/patternfly/ public/lib/patternfly
cp -Rf  node_modules/brace/ public/lib/brace