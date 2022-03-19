#enroll org1 admin
node enrollAdmin org1

#enroll org2 admin
node enrollAdmin org2

#setup 3 providers
count=10
for i in $(seq $count); do
    node registerEnrollUser org1 provider$i
done

#setup 3 customers
count=10
for i in $(seq $count); do
    node registerEnrollUser org2 customer$i
done

#setup 5 witnesses
count=15
for i in $(seq $count); do
    node registerEnrollUser org3 witness$i
done
