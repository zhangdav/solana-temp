const { Connection, PublicKey } = require('@solana/web3.js');
const fs = require('fs');

async function getRealOracleKeys() {
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  const queuePubkey = new PublicKey('A43DyUGA7s8eXPxqEjJY6EBu1KKbNgfxF8h17VAHn13w');
  
  try {
    console.log('正在获取队列账户数据...');
    const accountInfo = await connection.getAccountInfo(queuePubkey);
    
    if (!accountInfo) {
      throw new Error('队列账户不存在');
    }
    
    console.log('队列账户数据大小:', accountInfo.data.length);
    
    // 使用更精确的 Switchboard 队列数据结构解析
    const data = accountInfo.data;
    
    // Switchboard Queue 结构（简化版）
    // 偏移量参考 Switchboard 源码
    let offset = 8; // 跳过判别器
    
    // 读取基本字段
    offset += 32; // authority
    offset += 32; // dataBuffer
    offset += 4;  // size
    offset += 4;  // idx
    offset += 8;  // lastUpdate
    offset += 1;  // consecutive_feed_failure_limit
    offset += 1;  // consecutive_oracle_failure_limit
    offset += 4;  // unpermissioned_feeds_enabled
    offset += 1;  // enable_buffer_relayers
    offset += 8;  // variance_tolerance_multiplier
    offset += 4;  // feed_probation_period
    offset += 8;  // curr_idx
    offset += 8;  // gc_idx
    offset += 8;  // max_size
    offset += 8;  // reward
    offset += 8;  // min_stake
    offset += 1;  // slashing_enabled
    offset += 1;  // unpermissioned_vrf_enabled
    offset += 1;  // lock_lease_funding
    offset += 1;  // enable_tea_oracle
    offset += 1;  // require_authority_heartbeat_permission
    offset += 1;  // require_authority_feed_permission
    offset += 1;  // require_usage_permissions
    
    // 对齐到8字节边界
    while (offset % 8 !== 0) offset++;
    
    // 现在应该到达 oracle 数组
    console.log('当前偏移量:', offset);
    
    // 读取 oracle 数量（可能在不同位置）
    // 让我们尝试查找有效的公钥模式
    const oracles = [];
    const seenKeys = new Set();
    
    // 在数据中搜索有效的公钥
    for (let i = 0; i < data.length - 32; i++) {
      const keyBytes = data.slice(i, i + 32);
      
      // 检查是否可能是公钥（不全为0，不全为255）
      if (!keyBytes.every(b => b === 0) && !keyBytes.every(b => b === 255)) {
        try {
          const pubkey = new PublicKey(keyBytes);
          const keyStr = pubkey.toBase58();
          
          // 验证是否是有效的 base58 公钥格式
          if (keyStr.length === 44 && !seenKeys.has(keyStr)) {
            // 检查这个账户是否真的存在于主网
            try {
              const testAccount = await connection.getAccountInfo(pubkey);
              if (testAccount && testAccount.owner.toBase58() === 'SBondMDrcV3K4kxZR1HNVT7osZxAHVHgYXL5Ze1oMUv') {
                oracles.push(keyStr);
                seenKeys.add(keyStr);
                console.log(`找到有效的 oracle: ${keyStr}`);
              }
            } catch (e) {
              // 忽略无效账户
            }
          }
        } catch (e) {
          // 忽略无效的公钥
        }
      }
    }
    
    console.log(`\n总共找到 ${oracles.length} 个有效的 oracle 账户:`);
    oracles.forEach((oracle, index) => {
      console.log(`Oracle ${index}: ${oracle}`);
    });
    
    // 保存到文件
    const oracleData = {
      queue: queuePubkey.toBase58(),
      oracles: oracles,
      timestamp: new Date().toISOString(),
      count: oracles.length
    };
    
    fs.writeFileSync('verified-oracles.json', JSON.stringify(oracleData, null, 2));
    console.log(`\n✅ 验证的 Oracle 信息已保存到 verified-oracles.json`);
    
  } catch (error) {
    console.error('错误:', error.message);
  }
}

getRealOracleKeys(); 