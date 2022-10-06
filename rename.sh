#!/bin/bash
echo "Used to rename library traces to folder. Use with caution!"
exit
grep -rIl "Library"  src/app/ | while read line ; do sed -i "s/Library/Folder/g" ${line} ; done
grep -rIl "Libraies"  src/app/ | while read line ; do sed -i "s/Libraies/Folders/g" ${line} ; done
grep -rIl "libraries"  src/app/ | while read line ; do sed -i "s/libraries/folders/g" ${line} ; done
grep -rIl "library"  src/app/ | while read line ; do sed -i "s/library/folder/g" ${line} ; done
grep -rIl "libray"  src/app/ | while read line ; do sed -i "s/libray/folder/g" ${line} ; done
grep -rl "core-js/folder/web/timers" | while read line ; do sed -i 's/core-js\/folder/core-js\/library/g' ${line} ; done
grep -rIl "libs"  src/app/ | while read line ; do sed -i "s/libs/folders/g" ${line} ; done


find src/app/ -name "*libraries*" -type d | while read line ; do mv ${line} $(echo ${line} | sed "s/libraries/folders/g" ) ; done
find src/app/ -name "*libraries*" -type f | while read line ; do mv ${line} $(echo ${line} | sed "s/libraries/folders/g" ) ; done
find src/app/ -name "*library*" -type d | while read line ; do mv ${line} $(echo ${line} | sed "s/library/folder/g" ) ; done
find src/app/ -name "*library*" -type f | while read line ; do mv ${line} $(echo ${line} | sed "s/library/folder/g" ) ; done
find src/app/ -name "*libs*" -type d | while read line ; do mv ${line} $(echo ${line} | sed "s/libs/folders/g" ) ; done
find src/app/ -name "*libs*" -type f | while read line ; do mv ${line} $(echo ${line} | sed "s/libs/folders/g" ) ; done





#all-libs
#my-libs
#libs
#shared-libs
#share-admin-libs
